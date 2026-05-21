import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import Logo from './brand/Logo';

const navItems = [
  { path: '/assessment', label: 'Assessment' },
  { path: '/guidelines', label: 'Guidelines' },
  { path: '/locate', label: 'Locate' },
  { path: '/research', label: 'Research' },
  { path: '/about', label: 'About' },
];

type FooterLink = {
  label: string;
  to?: string;
  href?: string;
};

const footerColumns: Array<{ title: string; links: FooterLink[] }> = [
  {
    title: 'Screen',
    links: [
      { label: 'Assessment', to: '/assessment' },
      { label: 'Guide', to: '/guide' },
      { label: 'Locate', to: '/locate' },
      { label: 'Guidelines', to: '/guidelines' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'Research', to: '/research' },
      { label: 'Trials', to: '/research' },
      { label: 'Papers', to: '/research' },
      { label: 'Resources', to: '/guidelines' },
    ],
  },
  {
    title: 'Engage',
    links: [
      { label: 'Initiatives', to: '/initiatives' },
      { label: 'Chapters', href: 'https://www.alcsi.org/about/join' },
      { label: 'Donate', href: 'https://www.alcsi.org/about/support-us' },
      { label: 'Contact', to: '/about' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: 'https://www.alcsi.org/sms-terms-and-conditions' },
      { label: 'Terms', href: 'https://www.alcsi.org/sms-terms-and-conditions' },
      { label: 'Medical disclaimer', to: '/about' },
    ],
  },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-4 py-2 text-sm font-bold transition-colors ${
      isActive
        ? 'bg-[var(--color-brand-primary-soft)] text-[var(--color-brand-primary)]'
        : 'text-[var(--color-brand-aubergine)] hover:bg-white'
    }`;

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)]">
      <header className="sticky top-0 z-50 border-b border-[var(--color-line)] bg-[rgba(241,233,218,0.92)] backdrop-blur print-hidden">
        <div className="container-gedi flex h-28 items-center justify-between gap-6">
          <Logo />
          <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Link to="/assessment" className="btn btn-primary hidden xl:inline-flex">
            Check eligibility
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="rounded-full p-3 text-[var(--color-brand-aubergine)] xl:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Open navigation"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {open ? (
          <div id="mobile-nav" className="border-t border-[var(--color-line)] bg-[var(--color-surface)] p-4 xl:hidden">
            <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <NavLink key={item.path} to={item.path} onClick={() => setOpen(false)} className={linkClass}>
                  {item.label}
                </NavLink>
              ))}
              <Link to="/assessment" onClick={() => setOpen(false)} className="btn btn-primary mt-2">
                Check eligibility
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </nav>
          </div>
        ) : null}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="bg-[var(--color-brand-aubergine)] text-white print-hidden">
        <div className="container-gedi py-14">
          <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
            <div>
              <Logo className="brightness-0 invert" />
              <p className="mt-5 max-w-sm text-sm leading-6 text-white/75">
                GEDI turns screening guidelines into a clear plan, a place to call, and the words to use when booking.
              </p>
            </div>
            {footerColumns.map((column) => (
              <FooterColumn key={column.title} title={column.title} links={column.links} />
            ))}
          </div>
          <div className="mt-10 border-t border-white/15 pt-6 text-xs leading-5 text-white/55">
            <p>
              GEDI is an informational tool. It is not a diagnosis and does not replace consultation with a licensed healthcare professional.
              Recommendations follow ACS and USPSTF guidelines, last reviewed May 20, 2026.
            </p>
            <p className="mt-3">
              Follow ALCSI and Mass General for current screening, research, and outreach updates.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h2 className="eyebrow text-white/50">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm text-white/75">
        {links.map((link) => (
          <li key={link.label}>
            {link.to ? (
              <Link to={link.to} className="transition-colors hover:text-white">
                {link.label}
              </Link>
            ) : (
              <a href={link.href} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
