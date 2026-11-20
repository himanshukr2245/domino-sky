// lib/site.ts — the one place for the app's name, URL and description (hk:init rewrites these values).
export interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly badge?: string;
  readonly external?: boolean;
}

export const SITE = {
  name: 'Domino Sky',
  shortName: 'Domino Sky',
  description: 'See the cascade. Find the recovery. Prove the difference. A flight disruption simulator for PromptWars 2026.',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://domino-sky.hkr.dpdns.org').replace(/\/+$/, ''),
  slug: 'domino-sky',                                              // storage names, cache names (hk:init rewrites)
  author: 'Himanshu Kumar',
  track: 'PromptWars 2026',
  nav: [
    { href: '/app', label: 'Cockpit' },
    { href: '/about', label: 'About' },
    { href: '/support', label: 'Support' },
    { href: '/settings', label: 'Settings' },
  ] as readonly NavItem[],
} as const;

export const RELEASE = process.env.NEXT_PUBLIC_RELEASE ?? 'local';
