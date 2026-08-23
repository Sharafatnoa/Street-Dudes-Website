import { buildOrderConfirmationEmail, RESTAURANT_CONTACT } from '@/lib/email';
import type { Order } from '@/types/order';

describe('buildOrderConfirmationEmail', () => {
  const sampleOrder: Order = {
    id: 'test-order-1',
    orderNumber: '20260823-TEST',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'pending',
    customerName: 'Test Customer',
    customerEmail: 'info.streetdudes@gmail.com',
    customerPhone: '0700000000',
    fulfillmentType: 'delivery',
    deliveryAddress: 'Bohustgatan 12, 504 35 Borås, Sverige',
    deliveryApartment: '1201',
    deliveryPostalCode: '504 35',
    deliveryCity: 'Borås',
    deliveryLat: 57.72,
    deliveryLng: 12.94,
    items: [
      {
        menuItemId: 'smash-burger',
        name: 'Smash Burger',
        quantity: 1,
        unitPrice: 120,
        totalPrice: 120,
        addons: [],
      },
    ],
    subtotal: 120,
    deliveryFee: 49,
    total: 169,
    deliveryNotes: null,
    allergyNotes: null,
    refundStatus: 'none',
    locale: 'sv',
  };

  it('exports RESTAURANT_CONTACT with correct details', () => {
    expect(RESTAURANT_CONTACT.name).toBe('Street Dudes Borås');
    expect(RESTAURANT_CONTACT.address).toBe('Alingsåsvägen 40, 504 38 Borås');
    expect(RESTAURANT_CONTACT.phoneDisplay).toBe('0705-937920');
    expect(RESTAURANT_CONTACT.phoneHref).toBe('+46705937920');
  });

  it('renders correct footer contact info and tel: link in Swedish locale', () => {
    const { subject, html } = buildOrderConfirmationEmail(sampleOrder, 'sv');
    expect(subject).toContain('bekräftad');
    expect(html).toContain('Street Dudes Borås');
    expect(html).toContain('Alingsåsvägen 40, 504 38 Borås');
    expect(html).toContain('<a href="tel:+46705937920" style="color: #666;">0705-937920</a>');
  });

  it('renders correct footer contact info and tel: link in English locale', () => {
    const { subject, html } = buildOrderConfirmationEmail(sampleOrder, 'en');
    expect(subject).toContain('confirmed');
    expect(html).toContain('Street Dudes Borås');
    expect(html).toContain('Alingsåsvägen 40, 504 38 Borås');
    expect(html).toContain('<a href="tel:+46705937920" style="color: #666;">0705-937920</a>');
  });

  it('renders delivery address without duplicate postal code/city line', () => {
    const { html } = buildOrderConfirmationEmail(sampleOrder, 'sv');
    expect(html).toContain('Bohustgatan 12, 504 35 Borås, Sverige');
    expect(html).toContain('Lgh 1201');
    // Postal code and city should not be rendered on a standalone line after address
    expect(html).not.toContain('<br/>504 35 Borås');
    expect(html).not.toContain('<br/> 504 35');
  });

  it('does not duplicate apartment when deliveryAddress already contains it', () => {
    const orderWithAptInAddress: Order = {
      ...sampleOrder,
      deliveryAddress: 'Bohustgatan 12, Lgh 1201, 504 35 Borås, Sverige',
      deliveryApartment: '1201',
    };
    const { html } = buildOrderConfirmationEmail(orderWithAptInAddress, 'sv');
    expect(html).toContain('Bohustgatan 12, Lgh 1201, 504 35 Borås, Sverige');
    expect(html).not.toContain('<br/>Lgh 1201');
  });
});
