/**
 * Supabase client instances for Street Dudes ordering system.
 *
 * publicClient  — safe to use in browser and server components.
 *                 Limited by Row Level Security policies.
 *
 * getServerClient — uses service role key. ONLY use inside
 *                   API routes (src/app/api/). Never import
 *                   this in components or client code.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Public client — for reading config and realtime subscriptions
export const publicClient = createClient(supabaseUrl, supabaseAnonKey)

// Server client — for writing orders and updating status
// Only import this in API routes
export function getServerClient() {
  return createClient(supabaseUrl, supabaseServiceKey)
}
