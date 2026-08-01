import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import AcademySidebar from '@/components/academy/AcademySidebar';
import AcademyMobileNav from '@/components/academy/AcademyMobileNav';

export const metadata = {
  title: 'Creator Academy',
  description: 'Documentation and playbooks for growth, monetization, and workflow.',
};

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteNav />
      <AcademyMobileNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-10 flex-1 w-full">
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-8">
            <AcademySidebar />
          </div>
        </aside>
        <main className="flex-1 min-w-0 max-w-5xl">{children}</main>
      </div>
      <SiteFooter />
    </div>
  );
}
