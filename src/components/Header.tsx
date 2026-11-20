'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppearanceSwitch } from './AppearanceSwitch';
import { SITE } from '@/lib/site';
export function Header() {
  const pathname = usePathname();
  return <header className="ds-header"><Link href="/" className="ds-brand" aria-label="Domino Sky home"><svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="m4 24 10-17 4 7h-5L7 25M18 14l10 10H14l4-7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg><span>DOMINO<span className="text-cyan-fg"> SKY</span></span></Link><nav aria-label="Main navigation" className="ds-navigation">{SITE.nav.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined}>{item.label}</Link>)}</nav><AppearanceSwitch compact /></header>;
}
