import Link from 'next/link';
import { academyModules, getDoc } from '@/data/academy';

export default function AcademyHomePage() {
  return (
    <div>
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-lg mb-4">
          Creator Academy
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          PulseHub Documentation
        </h1>
        <p className="text-gray-600 text-lg">
          Reference guides and playbooks for growth, monetization, and workflow — written to be
          scanned, not read like an article.
        </p>
      </header>

      <div className="space-y-8">
        {academyModules.map((mod) => (
          <section key={mod.id}>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{mod.title}</h2>
            <p className="text-sm text-gray-500 mb-4">{mod.description}</p>
            <div className="space-y-2">
              {mod.docs.map((slug) => {
                const doc = getDoc(slug);
                if (!doc) return null;
                return (
                  <Link
                    key={doc.slug}
                    href={`/academy/${doc.slug}`}
                    className="block border border-primary-100 rounded-lg p-4 hover:border-primary-300 hover:shadow-sm transition bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{doc.title}</span>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{doc.readTime}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
