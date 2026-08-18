/**
 * Server-rendered Checkout Page route.
 * Performs server-side check for onlineOrderingEnabled before rendering checkout UI.
 */

import { getConfig } from '@/lib/getConfig';
import { InteractiveCheckoutPage } from '@/components/checkout/InteractiveCheckoutPage';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  let onlineOrderingEnabled = true;
  try {
    const config = await getConfig();
    onlineOrderingEnabled = config.onlineOrderingEnabled;
  } catch {
    onlineOrderingEnabled = true;
  }

  if (!onlineOrderingEnabled) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center p-6 text-center">
        <div className="bg-[#141414] border border-white/10 p-8 rounded-xl max-w-md w-full space-y-4 shadow-2xl">
          <div className="text-4xl">🚫</div>
          <h1 className="font-display text-2xl font-bold text-brand-gold uppercase tracking-wider">
            ONLINEBESTÄLLNING EJ TILLGÄNGLIG
          </h1>
          <p className="text-sm text-white/70">
            Onlinebeställning är inte tillgänglig just nu. Välkommen att besöka oss direkt i
            restaurangen!
          </p>
        </div>
      </div>
    );
  }

  return <InteractiveCheckoutPage />;
}
