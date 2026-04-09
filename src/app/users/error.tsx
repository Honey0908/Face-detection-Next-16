'use client';

export default function UsersError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-20">
      <div className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-white p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Failed to load users
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {error.message ||
            'Something went wrong while loading the users list.'}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
