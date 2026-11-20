import type { Metadata } from 'next';
import { Cockpit } from '@/components/domino/Cockpit';
export const metadata: Metadata = { title: 'Operations cockpit', alternates: { canonical: '/app' } };
export default function AppPage() { return <Cockpit />; }
