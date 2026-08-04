/**
 * Server page component for /kitchen dashboard.
 * Fetches config server-side and renders KitchenDashboard.
 */

import { getConfig } from '@/lib/getConfig';
import { KitchenDashboard } from '@/components/kitchen/KitchenDashboard';

export const dynamic = 'force-dynamic';

export default async function KitchenPage() {
  const config = await getConfig();

  return (
    <KitchenDashboard
      estimatedDeliveryMins={config.estimatedDeliveryMins}
      estimatedPickupMins={config.estimatedPickupMins}
    />
  );
}
