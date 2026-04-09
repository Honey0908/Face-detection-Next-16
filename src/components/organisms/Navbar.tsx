import Link from 'next/link';
import { isAdminFromCookies } from '@/lib/auth/admin.server';

export default async function Navbar() {
  const isAdmin = await isAdminFromCookies();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-lg font-bold text-gray-900 hover:text-gray-700"
          >
            🍽️ LunchTrack
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/scan"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Scan Lunch
            </Link>
            {isAdmin && (
              <Link
                href="/users"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Users
              </Link>
            )}
            <Link
              href="/register"
              className="text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 px-4 py-2 rounded-md transition-colors"
            >
              Register Employee
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
