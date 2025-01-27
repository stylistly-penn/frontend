import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <header className="w-full bg-blue-600 text-white py-4 shadow-md">
        <h1 className="text-2xl text-center font-bold">Welcome to My App</h1>
      </header>

      <main className="flex flex-col items-center mt-10">
        <p className="text-lg mb-6">This is the homepage.</p>
        <nav className="space-y-4">
          <Link
            href="/index"
            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Go to About Page
          </Link>
          <Link
            href="/marketplace"
            className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded"
          >
            Go to Marketplace
          </Link>
          <Link
            href="/dashboard"
            className="bg-yellow-500 hover:bg-yellow-700 text-white py-2 px-4 rounded"
          >
            Go to Dashboard
          </Link>
        </nav>
      </main>

      <footer className="w-full mt-auto py-4 bg-gray-200 text-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} My App</p>
      </footer>
    </div>
  );
}
