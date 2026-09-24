
"use client";

import { useState } from "react";
import Link from "next/link";
import { useWishlist } from "@/components/WishlistContext";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { wishlist } = useWishlist();
  const { cart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();

    if (!search.trim()) {
      return;
    }

    window.location.href = `/books?search=${encodeURIComponent(
      search.trim()
    )}`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#071A33] px-6 py-4 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center gap-6">

        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-xl font-bold"
        >
          <span className="text-2xl">📖</span>

          <span>
            Book<span className="text-[#E8B04A]">Store</span>
          </span>
        </Link>

        {/* Navigation OR Search */}
        <div className="flex flex-1 items-center justify-center">

          {!searchOpen ? (
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
              <Link href="/contUs" className="transition hover:text-[#E8B04A]">
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
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search books or authors..."
                autoFocus
                className="flex-1 px-5 py-2.5 text-[#071A33] outline-none"
              />

              <button
                type="submit"
                className="bg-[#E8B04A] px-6 font-semibold text-[#071A33] transition hover:bg-[#F3C866]"
              >
                Search
              </button>
            </form>
          )}

        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-4">

          {/* Search */}
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
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

          {/* Sign In 
          <Link
            href="/signin"
            className="rounded-md bg-[#E8B04A] px-5 py-2 font-semibold text-[#071A33] transition hover:bg-[#F3C866]"
          >
            Sign In
          </Link>*/}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="font-semibold text-white">
                👤 {user?.name}
              </span>

             <button
               type="button"
               onClick={logout}
               className="rounded-md bg-[#E8B04A] px-4 py-2 font-semibold text-[#071A33] transition hover:bg-[#F3C866]"
                >
                Sign Out
               </button>
            </div>
          ) : (
           <Link
              href="/signin"
              className="rounded-md bg-[#E8B04A] px-5 py-2 font-semibold text-[#071A33] transition hover:bg-[#F3C866]"
              >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

