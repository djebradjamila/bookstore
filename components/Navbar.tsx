
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#071A33] px-6 py-4 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold"
        >
          <span className="text-2xl">📖</span>
          <span>
            Book<span className="text-[#E8B04A]">Store</span>
          </span>
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-7 md:flex">
          <Link
            href="/"
            className="transition hover:text-[#E8B04A]"
          >
            Home
          </Link>

          <Link
            href="/books"
            className="transition hover:text-[#E8B04A]"
          >
            Books
          </Link>

          <Link
            href="/categories"
            className="transition hover:text-[#E8B04A]"
          >
            Categories
          </Link>

          <Link
            href="/wishlist"
            className="transition hover:text-[#E8B04A]"
          >
            ♡ Wishlist
          </Link>

          <Link
            href="/cart"
            className="transition hover:text-[#E8B04A]"
          >
            🛒 Cart
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="text-lg hover:text-[#E8B04A]">
            🔍
          </button>

          <Link
            href="/wishlist"
            className="text-lg hover:text-[#E8B04A]"
          >
            ♡
          </Link>

          <Link
            href="/cart"
            className="text-lg hover:text-[#E8B04A]"
          >
            🛒
          </Link>

          <button className="rounded-md bg-[#E8B04A] px-5 py-2 font-semibold text-[#071A33] transition hover:bg-[#F3C866]">
            Sign In
          </button>
        </div>

      </div>
    </nav>
  );
}

