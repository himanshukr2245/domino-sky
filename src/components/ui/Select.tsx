'use client';
import { forwardRef, type SelectHTMLAttributes } from 'react';
import { field } from './classes';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...props }, ref) {
  return <div className="relative"><select ref={ref} className={`${className ?? field} w-full appearance-none pr-10`} {...props}>{children}</select><svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></div>;
});
