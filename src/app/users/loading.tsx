export default function UsersLoading() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-8 w-56 rounded bg-gray-200" />
        <div className="mt-3 h-4 w-72 rounded bg-gray-200" />
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
          <div className="h-10 w-full rounded bg-gray-100" />
          <div className="mt-3 h-10 w-full rounded bg-gray-100" />
          <div className="mt-3 h-10 w-full rounded bg-gray-100" />
          <div className="mt-3 h-10 w-full rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
