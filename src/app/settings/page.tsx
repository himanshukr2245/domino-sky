import { AppearanceSwitch } from '@/components/AppearanceSwitch';
export default function SettingsPage() {
  return <section className="ds-workspace"><div className="ds-intro"><div><p className="ds-eyebrow">YOUR WORKSPACE</p><h1 className="ds-title">Settings</h1><p className="ds-intro-copy">Choose the appearance and motion that help you focus.</p></div></div><div className="ds-panel p-6"><h2 className="ds-section-title">Appearance & effects</h2><p className="text-fg-muted mb-6">Switch between light and dark. Reduce effects disables optional motion. Preferences stay in this browser.</p><AppearanceSwitch /></div></section>;
}
