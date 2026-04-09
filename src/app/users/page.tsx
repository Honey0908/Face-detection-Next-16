import Link from 'next/link';
import { redirect } from 'next/navigation';
import Navbar from '@/components/organisms/Navbar';
import { isAdminFromCookies } from '@/lib/auth/admin.server';
import {
  listUsers,
  type UsersSortField,
  type UsersSortOrder,
} from '@/lib/db/user';

type SearchParams = {
  page?: string;
  limit?: string;
  sort?: string;
  department?: string;
};

type UsersPageProps = {
  searchParams?: Promise<SearchParams>;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

function toPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

function parseSort(sortParam: string | undefined): {
  field: UsersSortField;
  order: UsersSortOrder;
} {
  const raw = sortParam ?? 'name';
  const isDesc = raw.startsWith('-');
  const field = (isDesc ? raw.slice(1) : raw) as UsersSortField;

  if (!['name', 'department', 'createdAt'].includes(field)) {
    return { field: 'name', order: 'asc' };
  }

  return {
    field,
    order: isDesc ? 'desc' : 'asc',
  };
}

function makeQuery(params: {
  page: number;
  limit: number;
  sort: string;
  department?: string;
}) {
  const query = new URLSearchParams();
  query.set('page', String(params.page));
  query.set('limit', String(params.limit));
  query.set('sort', params.sort);
  if (params.department) {
    query.set('department', params.department);
  }
  return `?${query.toString()}`;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const isAdmin = await isAdminFromCookies();
  if (!isAdmin) {
    redirect('/');
  }

  const resolvedParams = (await searchParams) ?? {};
  const page = toPositiveInt(resolvedParams.page, DEFAULT_PAGE);
  const limit = toPositiveInt(resolvedParams.limit, DEFAULT_LIMIT);
  const { field, order } = parseSort(resolvedParams.sort);
  const department = resolvedParams.department?.trim() || undefined;

  const result = await listUsers({
    page,
    limit: Math.min(limit, 100),
    sort: field,
    order,
    department,
  });

  const sortParam = `${order === 'desc' ? '-' : ''}${field}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-6 flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Registered Users</h1>
          <p className="text-sm text-gray-600">
            Showing page {result.page} of {result.totalPages} (
            {result.totalCount} total users)
          </p>
        </header>

        {result.users.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">
            No users registered
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table
              className="min-w-full divide-y divide-gray-200"
              aria-label="Registered users table"
            >
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Employee ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <Link
                      href={makeQuery({
                        page: 1,
                        limit,
                        sort: sortParam === 'name' ? '-name' : 'name',
                        department,
                      })}
                    >
                      Name
                    </Link>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <Link
                      href={makeQuery({
                        page: 1,
                        limit,
                        sort:
                          sortParam === 'department'
                            ? '-department'
                            : 'department',
                        department,
                      })}
                    >
                      Department
                    </Link>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <Link
                      href={makeQuery({
                        page: 1,
                        limit,
                        sort:
                          sortParam === '-createdAt'
                            ? 'createdAt'
                            : '-createdAt',
                        department,
                      })}
                    >
                      Registered Date
                    </Link>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {result.users.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {user.employeeId}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {user.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                      {user.department || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                      {user.email || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <nav
          className="mt-6 flex items-center justify-between"
          aria-label="Users pagination"
        >
          <Link
            href={makeQuery({
              page: Math.max(1, page - 1),
              limit,
              sort: sortParam,
              department,
            })}
            className={`rounded-md border px-4 py-2 text-sm ${
              page <= 1
                ? 'pointer-events-none border-gray-200 text-gray-400'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
            aria-disabled={page <= 1}
          >
            Previous
          </Link>
          <span className="text-sm text-gray-600">
            Page {page} / {result.totalPages}
          </span>
          <Link
            href={makeQuery({
              page: Math.min(result.totalPages, page + 1),
              limit,
              sort: sortParam,
              department,
            })}
            className={`rounded-md border px-4 py-2 text-sm ${
              page >= result.totalPages
                ? 'pointer-events-none border-gray-200 text-gray-400'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
            aria-disabled={page >= result.totalPages}
          >
            Next
          </Link>
        </nav>
      </main>
    </div>
  );
}
