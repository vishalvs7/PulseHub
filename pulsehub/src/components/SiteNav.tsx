import Link from 'next/link';

export default function SiteNav() {
  return (
    <nav className="border-b border-primary-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="grid grid-cols-3 items-center">
          <Link href="/" className="flex items-center space-x-2 justify-self-start">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-white">P</span>
            </div>
            <span className="text-xl font-bold text-primary-600">PulseHub</span>
          </Link>
          <div className="flex items-center justify-center space-x-8">
            <Link href="/tools" className="text-sm font-medium text-gray-600 hover:text-primary-700 transition">
              Free Tools
            </Link>
            <Link href="/academy" className="text-sm font-medium text-gray-600 hover:text-primary-700 transition">
              Academy
            </Link>
          </div>
          <div className="flex items-center space-x-4 justify-self-end">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
            <Link href="/register">
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
