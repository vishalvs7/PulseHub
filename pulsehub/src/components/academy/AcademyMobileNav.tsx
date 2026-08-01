'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { academyModules, getDoc } from '@/data/academy';

export default function AcademyMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden border-b border-primary-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-gray-700"
      >
        <span>Academy Menu</span>
        <ChevronDown className={`w-4 h-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-4">
          <Link href="/academy" onClick={() => setOpen(false)} className="block text-sm font-semibold text-primary-700">
            Documentation Home
          </Link>
          {academyModules.map((mod) => (
            <div key={mod.id}>
              <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {mod.title}
              </div>
              {mod.docs.map((slug) => {
                const doc = getDoc(slug);
                if (!doc) return null;
                return (
                  <Link
                    key={doc.slug}
                    href={`/academy/${doc.slug}`}
                    onClick={() => setOpen(false)}
                    className="block px-2 py-1.5 text-sm text-gray-600 hover:text-primary-700"
                  >
                    {doc.title}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
