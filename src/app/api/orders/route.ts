/**
 * POST /api/orders
 *
 * Creates a new order. Performs full server-side validation:
 * - Input field validation
 * - Restaurant open/pause check
 * - Delivery radius re-check (never trust client result)
 * - Price recalculation from menu.ts (never trust client prices)
 *
 * On success inserts a row into Supabase `orders` table
 * and returns the human-readable order number.
 *
 * All Postgres errors are logged server-side only;
 * the client only ever sees a safe Swedish message.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/lib/getConfig';
import { getRestaurantStatus, isAcceptingOrders } from '@/lib/openingHours';
import { geocodeAddress } from '@/lib/geocode';
import { calculateDistanceKm } from '@/lib/haversine';
import { getServerClient } from '@/lib/supabase';
import { menuCategories } from '@/data/menu';
import type { CartItem } from '@/types/order';

// getConfig() must always reflect the latest Supabase values so that
// opening hours, delivery radius, and fee changes take effect immediately.
// Without force-dynamic, Next.js caches the underlying fetch() across requests.
export const dynamic = 'force-dynamic';

// ── Types ────────────────────────────────────────────────────────────────────

type OrderRequestBody = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  fulfillmentType: 'delivery' | 'pickup';
  deliveryAddress: string | null;
  deliveryApartment: string | null;
  deliveryPostalCode: string | null;
  deliveryCity: string | null;
  deliveryLat: number | null;
  deliveryLng: number | null;
  items: CartItem[];
  deliveryNotes: string;
  allergyNotes: string;
};

// ── Price recalculation ───────────────────────────────────────────────────────

/**
 * Flat lookup map of all menu item prices keyed by item ID.
 * Built once at module load time so each request doesn't re-scan.
 */
const MENU_PRICE_MAP = new Map<string, number>(
  menuCategories.flatMap((cat) => cat.items.map((item) => [item.id, item.price])),
);

const SAUCE_ADDON_PRICE_KR = 10;

/**
 * Recalculates the price of a single cart item using authoritative
 * prices from menu.ts. Returns null if the menu item ID is unknown.
 * Never trusts CartItem.totalPrice from the client.
 */
function recalculateItemPrice(item: CartItem): number | null {
  const basePrice = MENU_PRICE_MAP.get(item.menuItemId);
  if (basePrice === undefined) return null;

  let price = basePrice;

  // Protein swap delta (0 for Halloumi at standard price, etc.)
  if (item.proteinSwap) {
    price += item.proteinSwap.priceDelta;
  }

  // Rice swap delta
  if (item.riceSwap) {
    price += item.riceSwap.priceDelta;
  }

  // Variant swap delta (e.g. flavor)
  if (item.selectedVariant) {
    price += item.selectedVariant.priceDelta;
  }

  // Sauce addon is always a fixed 10 kr
  if (item.addedSauce) {
    price += SAUCE_ADDON_PRICE_KR;
  }

  // Each addon uses its own menu price — not what the client claims
  for (const addon of item.addons) {
    const addonPrice = MENU_PRICE_MAP.get(addon.menuItemId);
    if (addonPrice !== undefined) {
      price += addonPrice;
    }
  }

  return price * item.quantity;
}

// ── Order number generation ───────────────────────────────────────────────────

/**
 * Generates a human-readable order number in format YYYYMMDD-XXXX.
 * The suffix is a 4-character alphanumeric chosen at random.
 * Collision probability is negligible for a single-location restaurant.
 */
function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${date}-${suffix}`;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── 1. Parse body ──────────────────────────────────────────────────────────

  let body: OrderRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Ogiltig förfrågan.' }, { status: 400 });
  }

  const {
    customerName,
    customerEmail,
    customerPhone,
    fulfillmentType,
    deliveryAddress,
    deliveryApartment,
    deliveryPostalCode,
    deliveryCity,
    deliveryLat,
    deliveryLng,
    items,
    deliveryNotes,
    allergyNotes,
  } = body;

  // ── 2. Validate required fields ───────────────────────────────────────────

  if (!customerName?.trim()) {
    return NextResponse.json({ error: 'Namn saknas.' }, { status: 400 });
  }

  if (!customerEmail?.trim() || !customerEmail.includes('@')) {
    return NextResponse.json({ error: 'Ange en giltig e-postadress.' }, { status: 400 });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Varukorgen är tom.' }, { status: 400 });
  }

  if (fulfillmentType !== 'delivery' && fulfillmentType !== 'pickup') {
    return NextResponse.json({ error: 'Ogiltigt leveranssätt.' }, { status: 400 });
  }

  if (fulfillmentType === 'delivery') {
    if (!deliveryAddress?.trim()) {
      return NextResponse.json({ error: 'Leveransadress saknas.' }, { status: 400 });
    }
    if (!customerPhone?.trim()) {
      return NextResponse.json({ error: 'Telefonnummer krävs för leverans.' }, { status: 400 });
    }
  }

  // ── 3. Load config (single Supabase call for both checks below) ───────────

  let config;
  try {
    config = await getConfig();
  } catch (err) {
    console.error('[orders] Failed to load config:', err);
    return NextResponse.json(
      { error: 'Kunde inte hämta restauranginformation. Försök igen.' },
      { status: 500 },
    );
  }

  // ── 4. Check restaurant is open ───────────────────────────────────────────

  if (!isAcceptingOrders(config)) {
    const status = getRestaurantStatus(config);
    return NextResponse.json(
      { error: status.message || 'Tyvärr är restaurangen stängd just nu.' },
      { status: 400 },
    );
  }

  // ── 5. Re-validate delivery radius server-side ────────────────────────────
  // The client validated earlier, but config or the address may have changed.

  let serverDeliveryFee = 0;

  if (fulfillmentType === 'delivery') {
    const geocodeResult = await geocodeAddress(deliveryAddress!);

    if (!geocodeResult.success) {
      return NextResponse.json(
        { error: 'Kunde inte hitta din leveransadress. Kontrollera adressen och försök igen.' },
        { status: 400 },
      );
    }

    const distanceKm = calculateDistanceKm(
      { lat: config.restaurantLat, lng: config.restaurantLng },
      geocodeResult.coordinates,
    );

    if (distanceKm > config.deliveryRadiusKm) {
      return NextResponse.json(
        {
          error: `Tyvärr levererar vi inte till din adress. Du är ${
            Math.round(distanceKm * 10) / 10
          } km från oss.`,
        },
        { status: 400 },
      );
    }

    serverDeliveryFee =
      config.freeDeliveryThresholdKr > 0
        ? 0 // will be set after subtotal is known
        : config.deliveryFeeKr;
  }

  // ── 6. Recalculate prices from menu.ts ────────────────────────────────────

  let serverSubtotal = 0;
  const recalcErrors: string[] = [];

  for (const item of items) {
    const lineTotal = recalculateItemPrice(item);
    if (lineTotal === null) {
      recalcErrors.push(item.menuItemId);
    } else {
      serverSubtotal += lineTotal;
    }
  }

  if (recalcErrors.length > 0) {
    console.warn('[orders] Unknown menu item IDs submitted:', recalcErrors);
    return NextResponse.json(
      { error: 'En eller flera rätter i din varukorg är inte längre tillgängliga.' },
      { status: 400 },
    );
  }

  if (serverSubtotal < config.minOrderKr) {
    return NextResponse.json(
      { error: `Minsta beställningsvärde är ${config.minOrderKr} kr.` },
      { status: 400 },
    );
  }

  // Now we know the subtotal, so we can set the delivery fee correctly
  if (fulfillmentType === 'delivery') {
    serverDeliveryFee = serverSubtotal >= config.freeDeliveryThresholdKr ? 0 : config.deliveryFeeKr;
  }

  const serverTotal = serverSubtotal + serverDeliveryFee;

  // ── 7. Insert into Supabase ───────────────────────────────────────────────

  const orderNumber = generateOrderNumber();
  const supabase = getServerClient();

  const { data: insertedOrder, error: insertError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      status: 'pending',
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim(),
      customer_phone: customerPhone?.trim() ?? '',
      fulfillment_type: fulfillmentType,
      delivery_address: deliveryAddress ?? null,
      delivery_apartment: deliveryApartment ?? null,
      delivery_postal_code: deliveryPostalCode ?? null,
      delivery_city: deliveryCity ?? null,
      delivery_lat: deliveryLat ?? null,
      delivery_lng: deliveryLng ?? null,
      items: items,
      subtotal: serverSubtotal,
      delivery_fee: serverDeliveryFee,
      total: serverTotal,
      delivery_notes: deliveryNotes?.trim() || null,
      allergy_notes: allergyNotes?.trim() || null,
    })
    .select('id, order_number')
    .single();

  if (insertError) {
    // Log full Postgres error server-side only — never send to client
    console.error('[orders] Supabase insert error:', insertError);
    return NextResponse.json(
      { error: 'Kunde inte spara din beställning. Försök igen om en stund.' },
      { status: 500 },
    );
  }

  // ── 8. Return success ─────────────────────────────────────────────────────

  return NextResponse.json({
    orderId: insertedOrder.id,
    orderNumber: insertedOrder.order_number,
    total: serverTotal,
  });
}
