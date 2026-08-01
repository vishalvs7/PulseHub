import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { academyDocs, academyModules, getDoc, getDocIndex } from '@/data/academy';

export function generateStaticParams() {
  return academyDocs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc(slug);
  return {
    title: doc ? `${doc.title} · PulseHub Academy` : 'Creator Academy',
    description: doc?.description,
  };
}

export default async function AcademyDocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();

  const index = getDocIndex(slug);
  const prev = index > 0 ? academyDocs[index - 1] : null;
  const next = index < academyDocs.length - 1 ? academyDocs[index + 1] : null;
  const module = academyModules.find((m) => m.id === doc.module);

  return (
    <article>
      <header className="mb-8">
        {module && (
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-lg mb-4">
            {module.title}
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{doc.title}</h1>
        <p className="text-gray-600">{doc.description}</p>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
          <span>{doc.readTime}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>Last updated August 2026</span>
        </div>
      </header>

      <div className="max-w-none">
        {doc.sections.map((section, i) => (
          <section key={i} className="mb-6">
            {section.heading && (
              <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">{section.heading}</h2>
            )}
            {section.body.map((p, j) => (
              <p key={j} className="text-gray-700 leading-relaxed mb-4">
                {p}
              </p>
            ))}
            {section.bullets && (
              <ul className="list-disc pl-6 space-y-2 mb-4">
                {section.bullets.map((b, k) => (
                  <li key={k} className="text-gray-700 leading-relaxed">
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <footer className="mt-12 border-t border-primary-100 pt-6">
        <div className="flex items-center justify-between gap-4">
          {prev ? (
            <Link
              href={`/academy/${prev.slug}`}
              className="flex-1 block border border-primary-100 rounded-lg p-4 hover:border-primary-300 hover:shadow-sm transition"
            >
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                <ArrowLeft className="w-3 h-3" /> Previous
              </div>
              <div className="text-sm font-semibold text-gray-900">{prev.title}</div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {next ? (
            <Link
              href={`/academy/${next.slug}`}
              className="flex-1 block border border-primary-100 rounded-lg p-4 hover:border-primary-300 hover:shadow-sm transition text-right"
            >
              <div className="flex items-center justify-end gap-1 text-xs text-gray-400 mb-1">
                Next <ArrowRight className="w-3 h-3" />
              </div>
              <div className="text-sm font-semibold text-gray-900">{next.title}</div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </footer>
    </article>
  );
}
