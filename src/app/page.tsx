import Link from 'next/link';
import Navbar from '@/components/organisms/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
            Smart Office Lunch Tracking
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Automatically track employee lunch attendance using facial
            recognition. Fast, accurate, and privacy-preserving — no images
            stored.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col gap-4">
            <span className="text-3xl">📷</span>
            <h2 className="text-xl font-semibold text-gray-900">Scan Lunch</h2>
            <p className="text-gray-600 text-sm flex-1">
              Employees scan their face at the cafeteria entrance. The system
              identifies them in under 300 ms and records the lunch
              automatically.
            </p>
            <Link
              href="/scan"
              className="inline-block text-center text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 px-5 py-2.5 rounded-md transition-colors"
            >
              Go to Scanner →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col gap-4">
            <span className="text-3xl">🧑‍💼</span>
            <h2 className="text-xl font-semibold text-gray-900">
              Register Employee
            </h2>
            <p className="text-gray-600 text-sm flex-1">
              Admins enrol new employees by capturing 3–5 face images. Only the
              computed descriptors are stored — raw images are never saved.
            </p>
            <Link
              href="/register"
              className="inline-block text-center text-sm font-medium text-gray-900 border border-gray-300 hover:bg-gray-100 px-5 py-2.5 rounded-md transition-colors"
            >
              Register Employee →
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            How it works
          </h2>
          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-600">
            {[
              {
                step: '1',
                icon: '👤',
                title: 'Enrol',
                desc: 'Admin registers the employee with face scans.',
              },
              {
                step: '2',
                icon: '🔍',
                title: 'Detect',
                desc: 'Webcam detects and extracts face descriptor at lunch time.',
              },
              {
                step: '3',
                icon: '✅',
                title: 'Record',
                desc: 'System matches the face and logs the lunch count.',
              },
            ].map(({ step, icon, title, desc }) => (
              <li
                key={step}
                className="flex flex-col items-center text-center gap-2"
              >
                <span className="text-3xl">{icon}</span>
                <span className="font-semibold text-gray-900">{title}</span>
                <span>{desc}</span>
              </li>
            ))}
          </ol>
        </div>
      </main>
    </div>
  );
}
