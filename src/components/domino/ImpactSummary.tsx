import type { SimulationMetrics } from '@/types/contracts/generated';

export function ImpactSummary({ metrics }: { metrics: SimulationMetrics }) {
  const items = [
    { label: 'Delayed flights', value: metrics.delayedFlights, unit: `of ${metrics.totalFlights} scheduled`, id: 'delayed-flights', tone: 'delay' },
    { label: 'Total arrival delay', value: metrics.totalArrivalDelay, unit: 'flight minutes', id: 'arrival-delay', tone: 'delay' },
    { label: 'Passengers missing connections', value: metrics.missedConnectionPassengers, unit: `${metrics.missedConnections} connection groups`, id: 'missed-passengers', tone: 'passengers' },
    { label: 'Crew duty breaches', value: metrics.crewBreaches, unit: 'projected rosters', id: 'crew-breaches', tone: 'crew' },
  ];
  return (
    <section className="ds-metrics" aria-label="Calculated impact across the entire network">
      {items.map(item => (
        <div key={item.id} className={`ds-panel ds-metric ${item.value ? `ds-metric-${item.tone}` : ''}`}>
          <p>{item.label}</p>
          <div><strong data-testid={item.id}>{item.value.toLocaleString('en-IN')}</strong><span>{item.unit}</span></div>
        </div>
      ))}
    </section>
  );
}
