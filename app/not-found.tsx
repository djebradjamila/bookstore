import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F8F4EC] flex items-center justify-center px-6">
      <div className="text-center max-w-xl">
        <p className="text-7xl font-bold text-[#E8B04A]">404</p>

        <h1 className="mt-6 text-3xl md:text-4xl font-bold text-[#071A33]">
          Page not found
        </h1>

        <p className="mt-4 text-gray-600 text-lg">
          Sorry, the page you are looking for does not exist or may have been
          moved.
        </p>

        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-[#071A33] px-8 py-3 font-semibold text-white transition hover:bg-[#E8B04A] hover:text-[#071A33]"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}