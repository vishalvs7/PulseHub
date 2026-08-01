import Link from 'next/link';
import { ArrowRight, BookOpen, GraduationCap, Clock } from 'lucide-react';
import { academyModules, academyDocs, getDoc } from '@/data/academy';

export default function AcademyHomePage() {
  const totalDocs = academyDocs.length;

  return (
    <div>
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-lg mb-4">
          <GraduationCap className="w-3.5 h-3.5" /> Creator Academy
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          PulseHub Documentation
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl">
          {totalDocs} reference guides across {academyModules.length} modules — for growth, monetization, and
          workflow. Written to be scanned, not read like an article.
        </p>
      </header>

      <div className="mb-12">
        <Link
          href={`/academy/${academyDocs[0].slug}`}
          className="block bg-primary-600 text-white rounded-lg p-8 hover:bg-primary-700 transition shadow-soft"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Start here
              </div>
              <h2 className="text-2xl font-bold mb-1">{academyDocs[0].title}</h2>
              <p className="text-white/80">{academyDocs[0].description}</p>
            </div>
            <ArrowRight className="w-6 h-6 text-white/80" />
          </div>
        </Link>
      </div>

      <div className="space-y-10">
        {academyModules.map((mod) => (
          <section key={mod.id}>
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{mod.title}</h2>
                <p className="text-sm text-gray-500">{mod.description}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                {mod.docs.length} guides
              </span>
            </div>
            <div className="space-y-2">
              {mod.docs.map((slug) => {
                const doc = getDoc(slug);
                if (!doc) return null;
                return (
                  <Link
                    key={doc.slug}
                    href={`/academy/${doc.slug}`}
                    className="flex items-center justify-between gap-4 border border-primary-100 rounded-lg p-4 hover:border-primary-300 hover:shadow-sm transition bg-white"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary-600" />
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{doc.title}</div>
                        <div className="text-sm text-gray-500 truncate">{doc.description}</div>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-gray-400 inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {doc.readTime}
                    </span>
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
