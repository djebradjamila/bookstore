import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F4EC] text-[#071A33]">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="w-64 bg-[#071A33] text-white">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-[#E8B04A]">
              BookStore
            </h1>

            <p className="mt-1 text-sm text-gray-300">
              Admin Panel
            </p>
          </div>

          <nav className="px-4 space-y-2">
            <Link
              href="/admin/dashboard"
              className="block rounded-lg px-4 py-3 hover:bg-white/10 transition"
            >
              📊 Dashboard
            </Link>

            <Link
              href="/admin/products"
              className="block rounded-lg px-4 py-3 hover:bg-white/10 transition"
            >
              📚 Products
            </Link>

            <Link
              href="/admin/categories"
              className="block rounded-lg px-4 py-3 hover:bg-white/10 transition"
            >
              🏷️ Categories
            </Link>

            <Link
              href="/admin/users"
              className="block rounded-lg px-4 py-3 hover:bg-white/10 transition"
            >
              👥 Users
            </Link>

            <Link
              href="/admin/orders"
              className="block rounded-lg px-4 py-3 hover:bg-white/10 transition"
            >
              🛒 Orders
            </Link>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>

      </div>
    </div>
  );
}