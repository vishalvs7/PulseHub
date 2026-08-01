'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { academyModules, getDoc } from '@/data/academy';

export default function AcademySidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-6">
      <div>
        <Link
          href="/academy"
          className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
            pathname === '/academy'
              ? 'bg-primary-600 text-white'
              : 'text-gray-700 hover:bg-primary-50'
          }`}
        >
          Documentation Home
        </Link>
      </div>

      {academyModules.map((mod) => (
        <div key={mod.id}>
          <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
            {mod.title}
          </div>
          <ul className="mt-1 space-y-0.5 border-l border-primary-100 ml-3">
            {mod.docs.map((slug) => {
              const doc = getDoc(slug);
              if (!doc) return null;
              const active = pathname === `/academy/${doc.slug}`;
              return (
                <li key={doc.slug}>
                  <Link
                    href={`/academy/${doc.slug}`}
                    className={`block -ml-px border-l-2 px-3 py-1.5 text-sm leading-snug transition ${
                      active
                        ? 'border-primary-600 text-primary-700 font-semibold bg-primary-50/60'
                        : 'border-transparent text-gray-600 hover:text-primary-700 hover:bg-primary-50/50'
                    }`}
                  >
                    {doc.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
