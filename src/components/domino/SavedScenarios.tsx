'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { savedScenarioSchema, savedScenariosSchema, type SavedScenario } from '@/lib/recovery-boundary';
import { formatTime } from '@/lib/simulation/time';
import type { AirportClosure } from '@/types/contracts/generated';

export function SavedScenarios({ closure, candidateId, onLoad }: { closure?: AirportClosure; candidateId?: string; onLoad: (scenario: SavedScenario) => void }) {
  const [rows, setRows] = useState<SavedScenario[]>([]), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  async function load() {
    setBusy(true);
    try {
      const response = await fetch('/api/scenarios', { cache: 'no-store' });
      if (!response.ok) throw new Error();
      const parsed = savedScenariosSchema.safeParse(await response.json());
      if (!parsed.success) throw new Error();
      setRows(parsed.data); setMessage(parsed.data.length ? 'Saved scenarios loaded for this browser.' : 'No saved scenarios for this browser yet.');
    } catch { setMessage('Saved scenarios are temporarily unavailable. Your current simulation is still available.'); }
    finally { setBusy(false); }
  }
  async function save() {
    if (!closure) return;
    setBusy(true);
    try {
      const response = await fetch('/api/scenarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ closure, ...(candidateId ? { candidateId } : {}) }) });
      if (!response.ok) throw new Error();
      const parsed = savedScenarioSchema.safeParse(await response.json());
      if (!parsed.success) throw new Error();
      setRows(previous => [parsed.data, ...previous.filter(row => row.id !== parsed.data.id)].slice(0, 12)); setMessage('Scenario saved to Supabase for this browser.');
    } catch { setMessage('The scenario could not be saved. Please try again after the database is available.'); }
    finally { setBusy(false); }
  }
  return <section className="ds-panel ds-saved" aria-labelledby="saved-heading"><div><p className="ds-eyebrow">SCENARIO LIBRARY</p><h2 id="saved-heading" className="ds-section-title">Keep a decision worth revisiting.</h2><p className="text-sm text-fg-muted">Save closure inputs and the applied recovery in Supabase. This browser session controls access.</p></div><div className="ds-recovery-buttons"><Button variant="secondary" sound="none" disabled={!closure || busy} onClick={save}>Save scenario</Button><Button variant="quiet" sound="none" disabled={busy} onClick={load}>{busy ? 'Working…' : 'Load saved scenarios'}</Button></div><p role="status" aria-live="polite" className="ds-advice-note">{message}</p>{rows.length > 0 && <div className="ds-saved-list">{rows.map(row => <Button key={row.id} variant="plain" size="none" sound="none" className="ds-saved-row" onClick={() => onLoad(row)}><strong>{row.airport} · {formatTime(row.start_minute)}–{formatTime(row.end_minute)} IST</strong><span>{row.candidate_id ? 'Saved with recovery' : 'Disruption scenario'}</span></Button>)}</div>}</section>;
}
