'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from './icons.jsx';

const LINKS = [
  { href: '/dashboard', icon: 'home', label: 'Overview', exact: true },
  { href: '/dashboard/applications', icon: 'file-text', label: 'My Applications' },
  { href: '/dashboard/profile', icon: 'user', label: 'My Profile' },
  { href: '/dashboard/security', icon: 'shield', label: 'Security' },
];

export default function DashNav() {
  const pathname = usePathname();
  const isActive = (l) => (l.exact ? pathname === l.href : pathname.startsWith(l.href));
  return (
    <nav className="dash__nav" aria-label="Dashboard">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className={isActive(l) ? 'is-active' : ''} aria-current={isActive(l) ? 'page' : undefined}>
          <Icon name={l.icon} size={17} /> {l.label}
        </Link>
      ))}
    </nav>
  );
}
