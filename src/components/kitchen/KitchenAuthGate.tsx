/**
 * Auth gate wrapper for /kitchen routes.
 * Checks /api/kitchen/auth and renders PIN entry screen if unauthenticated.
 */

'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { KitchenPinScreen } from './KitchenPinScreen';

export function KitchenAuthGate({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  async function checkAuth() {
    try {
      const res = await fetch('/api/kitchen/auth', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(Boolean(data.authenticated));
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/50 text-sm">
        Verifierar behörighet...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <KitchenPinScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  return <>{children}</>;
}
