'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserMenu() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, { passive: true });
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isLoaded) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  if (!user) {
    return null; // Handled by parent Server Component
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full focus:outline-none"
        aria-expanded={dropdownOpen}
        aria-controls="user-menu"
        aria-label="User menu"
      >
        {user.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={user.fullName ?? 'Profile'}
            width={40}
            height={40}
            className="rounded-full"
            sizes="40px"
            loading="lazy"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg text-primary-foreground">
            {user.fullName?.charAt(0) ?? 'U'}
          </div>
        )}
      </button>
      {dropdownOpen && (
        <div
          id="user-menu"
          className="absolute right-0 mt-2 w-48 rounded-lg bg-background p-2 shadow-lg"
        >
          <div className="mb-2 border-b px-2 pb-2">
            <div className="font-medium">{user.fullName ?? 'User'}</div>
            <div className="truncate text-sm text-muted-foreground">
              {user.primaryEmailAddress?.emailAddress ?? 'No email'}
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => signOut({ redirectUrl: '/' })}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      )}
    </div>
  );
}