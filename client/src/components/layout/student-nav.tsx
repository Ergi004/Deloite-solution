'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { useLogout } from '@/hooks/use-logout';

const LINKS = [
  { href: '/career-path', label: 'My Path' },
  { href: '/profile', label: 'Profile' },
];

export function StudentNav() {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/career-path" className="font-semibold tracking-tight">
          DeloitteElevate
        </Link>
        <nav className="flex items-center gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                pathname.startsWith(link.href) && 'bg-muted text-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={logout}>
            Log out
          </Button>
        </nav>
      </div>
    </header>
  );
}
