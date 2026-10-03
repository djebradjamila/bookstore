
"use client";

import Link from "next/link";
import { useState } from "react";
import { useWishlist } from "@/components/WishlistContext";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { wishlist } = useWishlist();
  const { cart } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  /*
   * IMPORTANT:
   * An admin can be authenticated globally, but must NOT
   * be treated as a client on the client-side interface.
   */
  const isClientAuthenticated =
    isAuthenticated && !isAdmin;

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();

    if (!search.trim()) return;

    router.push(
      `/books?search=${encodeURIComponent(search.trim())}`
    );

    setSearchOpen(false);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("wishlist");
    router.push("/");
  };

  const closeMobileMenu = (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    const details =
      event.currentTarget.closest("details");

    if (details) {
      details.removeAttribute("open");
    }
  };

  const handleMobileLogout = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    const details =
      event.currentTarget.closest("details");

    if (details) {
      details.removeAttribute("open");
    }

    logout();
    localStorage.removeItem("wishlist");
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#071A33] px-4 py-3 text-white shadow-lg sm:px-6 sm:py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">

        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-bold sm:text-xl"
        >
          <span className="text-xl sm:text-2xl">
            📖
          </span>

          <span>
            Book
            <span className="text-[#E8B04A]">
              Store
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden flex-1 items-center justify-center md:flex">
          {!searchOpen ? (
            <div className="flex items-center gap-6 lg:gap-7">

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

              {/* Only clients can see My Orders */}
              {isClientAuthenticated && (
                <Link
                  href="/orders"
                  className="transition hover:text-[#E8B04A]"
                >
                  My Orders
                </Link>
              )}

              <Link
                href="/contUs"
                className="transition hover:text-[#E8B04A]"
              >
                Contact
              </Link>

            </div>
          ) : (
            <form
              onSubmit={handleSearch}
              className="flex w-full max-w-xl overflow-hidden rounded-full bg-white shadow-lg"
            >
              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search books or authors..."
                autoFocus
                className="flex-1 px-5 py-2.5 text-[#071A33] outline-none"
              />

              <button
                type="submit"
                className="bg-[#E8B04A] px-6 font-semibold text-[#071A33]"
              >
                Search
              </button>
            </form>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden shrink-0 items-center gap-4 md:flex">

          {/* Search */}
          <button
            type="button"
            onClick={() =>
              setSearchOpen(!searchOpen)
            }
            className="text-lg transition hover:text-[#E8B04A]"
          >
            {searchOpen ? "✕" : "🔍"}
          </button>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="text-lg transition hover:text-[#E8B04A]"
          >
            ♡ {wishlist.length}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="text-lg transition hover:text-[#E8B04A]"
          >
            🛒 {cartCount}
          </Link>

          {/* CLIENT AUTHENTICATION */}
          {isClientAuthenticated ? (
            <div className="flex items-center gap-3">

              {/* Client Profile */}
              <Link
                href="/profile"
                className="max-w-[150px] truncate font-semibold transition hover:text-[#E8B04A]"
              >
                👤 {user?.name}
              </Link>

              {/* Client Sign Out */}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md bg-[#E8B04A] px-4 py-2 font-semibold text-[#071A33]"
              >
                Sign Out
              </button>

            </div>
          ) : (
            /*
             * This includes:
             * - nobody logged in
             * - an admin logged in
             *
             * In both cases, the CLIENT navbar shows Sign In.
             */
            <Link
              href="/signin"
              className="rounded-md bg-[#E8B04A] px-5 py-2 font-semibold text-[#071A33]"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-3 md:hidden">

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="text-lg"
          >
            ♡ {wishlist.length}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="text-lg"
          >
            🛒 {cartCount}
          </Link>

          {/* Mobile Menu */}
          <details className="relative">

            <summary className="list-none cursor-pointer p-2 text-2xl">
              ☰
            </summary>

            <div className="absolute right-0 top-12 z-[100] w-64 rounded-xl bg-[#071A33] p-5 shadow-2xl">

              {/* Mobile Search */}
              <form
                onSubmit={handleSearch}
                className="mb-5 flex overflow-hidden rounded-full bg-white"
              >
                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search books..."
                  className="min-w-0 flex-1 px-4 py-2 text-[#071A33] outline-none"
                />

                <button
                  type="submit"
                  className="bg-[#E8B04A] px-4 text-[#071A33]"
                >
                  🔍
                </button>
              </form>

              {/* Mobile Navigation */}
              <div className="flex flex-col gap-4">

                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className="hover:text-[#E8B04A]"
                >
                  Home
                </Link>

                <Link
                  href="/books"
                  onClick={closeMobileMenu}
                  className="hover:text-[#E8B04A]"
                >
                  Books
                </Link>

                <Link
                  href="/categories"
                  onClick={closeMobileMenu}
                  className="hover:text-[#E8B04A]"
                >
                  Categories
                </Link>

                {/* Only clients see My Orders */}
                {isClientAuthenticated && (
                  <Link
                    href="/orders"
                    onClick={closeMobileMenu}
                    className="hover:text-[#E8B04A]"
                  >
                    📦 My Orders
                  </Link>
                )}

                {/* Only clients see Profile */}
                {isClientAuthenticated && (
                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="hover:text-[#E8B04A]"
                  >
                    👤 My Profile
                  </Link>
                )}

                <Link
                  href="/contUs"
                  onClick={closeMobileMenu}
                  className="hover:text-[#E8B04A]"
                >
                  Contact
                </Link>

                <Link
                  href="/wishlist"
                  onClick={closeMobileMenu}
                  className="hover:text-[#E8B04A]"
                >
                  ♡ Wishlist ({wishlist.length})
                </Link>

                <Link
                  href="/cart"
                  onClick={closeMobileMenu}
                  className="hover:text-[#E8B04A]"
                >
                  🛒 Cart ({cartCount})
                </Link>

                {/* User Section */}
                <div className="border-t border-white/10 pt-4">

                  {isClientAuthenticated ? (
                    <div className="flex flex-col gap-3">

                      {/* Client Profile */}
                      <Link
                        href="/profile"
                        onClick={closeMobileMenu}
                        className="font-semibold hover:text-[#E8B04A]"
                      >
                        👤 {user?.name}
                      </Link>

                      {/* Client Sign Out */}
                      <button
                        type="button"
                        onClick={handleMobileLogout}
                        className="w-fit rounded-md bg-[#E8B04A] px-5 py-2 font-semibold text-[#071A33]"
                      >
                        Sign Out
                      </button>

                    </div>
                  ) : (
                    /*
                     * Nobody logged in OR admin logged in:
                     * show client Sign In only.
                     */
                    <Link
                      href="/signin"
                      onClick={closeMobileMenu}
                      className="inline-block rounded-md bg-[#E8B04A] px-5 py-2 font-semibold text-[#071A33]"
                    >
                      Sign In
                    </Link>
                  )}

                </div>
              </div>
            </div>
          </details>
        </div>

      </div>
    </nav>
  );
}

