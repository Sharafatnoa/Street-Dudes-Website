/**
 * Auth gate wrapper for /admin routes.
 * Checks /api/admin/auth and renders AdminPinScreen if unauthenticated.
 */

'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { AdminPinScreen } from './AdminPinScreen';

export function AdminAuthGate({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  async function checkAuth() {
    try {
      const res = await fetch('/api/admin/auth', { cache: 'no-store' });
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
        Verifierar adminbehörighet...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminPinScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  return <>{children}</>;
}
