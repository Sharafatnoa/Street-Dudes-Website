import { redirect } from 'next/navigation';

/**
 * RootPage acts as an entry-point redirect.
 *
 * WHY: Safeguards the entry-point by redirecting any root bypass direct hits to the default /sv route.
 */
export default function RootPage() {
  redirect('/sv');
}
