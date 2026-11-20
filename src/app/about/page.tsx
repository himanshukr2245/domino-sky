import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui';
export const metadata: Metadata = { title: 'About the simulation', alternates: { canonical: '/about' } };

export default function AboutPage() {
  return <article className="ds-workspace">
    <div className="ds-intro"><div><p className="ds-eyebrow">MODEL & ASSUMPTIONS</p><h1 className="ds-title">About Domino Sky</h1><p className="ds-intro-copy">A flight disruption cascade and recovery simulator, built for PromptWars 2026.</p></div><ButtonLink href="/app" font="sans" sound="none">Open cockpit</ButtonLink></div>
    <section className="ds-panel p-6"><h2 className="ds-section-title">Follow the consequences.</h2><p>Close an airport and the engine recalculates the supplied flight rotations, passenger connections, and projected crew duty. Select a flight to inspect its schedule and the constraints that moved it.</p></section>
    <section className="ds-panel p-6"><h2 className="ds-section-title">What the model assumes</h2><ul className="list-disc pl-6 space-y-3 text-fg-muted"><li>All times are IST minutes from one operating day. The closing instant is blocked; the reopening instant is allowed.</li><li>Flights keep their supplied block times. Aircraft wait on the ground to avoid a closed arrival airport.</li><li>The minimum turnaround is 30 minutes. Additional scheduled ground time can absorb delay.</li><li>Connections require the supplied minimum transfer time. Flights do not automatically wait for connecting passengers.</li><li>Crew duty ends at the final projected arrival. A duty breach is an infeasible projected roster, not permission to operate.</li><li>Flight passenger counts represent boardings. Connection passenger groups are counted separately and are not added into a unique-person total.</li><li>Airport capacity is informational. Slot allocation, weather, diversions, ferry flights, and reserve crews are not modeled.</li></ul></section>
    <section className="ds-panel p-6"><h2 className="ds-section-title">Data and current scope</h2><p>The network is the synthetic flight_network.json supplied for the hackathon. No live airline feed or personal passenger data is used. This phase implements disruption and inspection; recovery comparison and Gemini advice are planned next.</p></section>
  </article>;
}
