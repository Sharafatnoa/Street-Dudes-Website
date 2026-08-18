/**
 * Server-rendered Order Page route.
 * Performs server-side check for onlineOrderingEnabled before rendering interactive ordering UI.
 */

import { getConfig } from '@/lib/getConfig';
import { Navbar } from '@/components/Navbar';
import { InteractiveOrderPage } from '@/components/order/InteractiveOrderPage';

export const dynamic = 'force-dynamic';

export default async function OrderPage() {
  let onlineOrderingEnabled = true;
  try {
    const config = await getConfig();
    onlineOrderingEnabled = config.onlineOrderingEnabled;
  } catch {
    onlineOrderingEnabled = true;
  }

  if (!onlineOrderingEnabled) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-white flex flex-col">
        <Navbar onlineOrderingEnabled={false} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
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
      </div>
    );
  }

  return <InteractiveOrderPage />;
}
