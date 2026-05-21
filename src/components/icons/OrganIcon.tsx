import type { CancerType } from '../../lib/gedi';

type OrganIconProps = {
  type: CancerType;
  className?: string;
  label?: string;
};

export default function OrganIcon({ type, className = 'h-10 w-10', label }: OrganIconProps) {
  const title = label ?? `${type} screening icon`;
  if (type === 'lung') {
    return (
      <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 8v48" />
        <path d="M29 24c-8-9-15-10-19-6-6 6-4 30 8 35 7 3 11-5 11-17V24Z" />
        <path d="M35 24c8-9 15-10 19-6 6 6 4 30-8 35-7 3-11-5-11-17V24Z" />
      </svg>
    );
  }
  if (type === 'breast') {
    return (
      <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 37c0-11 8-20 18-20s18 9 18 20c0 9-7 16-18 16s-18-7-18-16Z" />
        <path d="M23 38a9 9 0 0 0 18 0" />
        <path d="M32 17V9" />
      </svg>
    );
  }
  if (type === 'cervical') {
    return (
      <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12c2 10 6 16 12 16s10-6 12-16" />
        <path d="M24 28v10c0 8 4 14 8 14s8-6 8-14V28" />
        <path d="M18 52h28" />
      </svg>
    );
  }
  if (type === 'colorectal') {
    return (
      <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10c-8 4-10 15-4 22 4 5 13 6 18 2 5-4 4-12-1-14-4-2-9 0-10 4" />
        <path d="M38 54c8-4 10-15 4-22-4-5-13-6-18-2-5 4-4 12 1 14 4 2 9 0 10-4" />
      </svg>
    );
  }
  if (type === 'prostate') {
    return (
      <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 10v18" />
        <path d="M22 28c-5 3-8 8-8 14 0 7 5 12 12 12 3 0 5-1 6-3 1 2 3 3 6 3 7 0 12-5 12-12 0-6-3-11-8-14" />
        <path d="M24 34h16" />
      </svg>
    );
  }
  if (type === 'liver') {
    return (
      <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 35c2-14 13-23 29-23 10 0 15 4 15 11 0 14-16 28-33 28-8 0-13-6-11-16Z" />
        <path d="M38 13c-3 10-2 20 5 29" />
      </svg>
    );
  }
  if (type === 'skin') {
    return (
      <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 48c8-22 28-22 36 0" />
        <path d="M22 38c3 3 7 4 10 1 4-4 8-4 12-1" />
        <circle cx="34" cy="27" r="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 32c0-9 6-16 14-16s14 7 14 16-6 16-14 16-14-7-14-16Z" />
      <path d="M24 31h16" />
      <path d="M32 23v16" />
    </svg>
  );
}
