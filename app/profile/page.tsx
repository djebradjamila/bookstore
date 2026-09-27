"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { useWishlist } from "@/components/WishlistContext";
import { useCart } from "@/components/CartContext";

export default function Profile() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlist } = useWishlist();
  const { cart } = useCart();

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const handleLogout = () => {
    logout();
    localStorage.removeItem("wishlist");
    router.push("/");
  };

  if (!isAuthenticated || !user) {
    return (
      <main className="min-h-screen bg-[#F8F4EC] px-6 py-12">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#071A33] text-4xl text-white">
            👤
          </div>

          <h1 className="mt-6 text-3xl font-bold text-[#071A33]">
            Sign In Required
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Please sign in to access your profile.
          </p>

          <Link
            href="/signin"
            className="mt-6 inline-block rounded-full bg-[#E8B04A] px-8 py-3 text-sm font-semibold text-[#071A33] transition hover:bg-[#F3C866]"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F4EC] px-6 py-10">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#B8892D]">
            Account
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#071A33] md:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Manage your account information and activity.
          </p>
        </div>

        {/* Profile Card */}
        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">

          {/* Profile Header */}
          <div className="bg-[#071A33] px-6 py-8 text-white md:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#E8B04A] text-4xl text-[#071A33]">
                👤
              </div>

              <div>
                <p className="text-sm text-white/60">
                  Welcome back
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {user.name}
                </h2>

                <p className="mt-1 text-sm text-white/70">
                  {user.email}
                </p>
              </div>

            </div>
          </div>

          {/* Account Information */}
          <div className="p-6 md:p-8">

            <h2 className="text-xl font-bold text-[#071A33]">
              Personal Information
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">

              <div className="rounded-2xl bg-[#F8F4EC] p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Full Name
                </p>

                <p className="mt-2 font-semibold text-[#071A33]">
                  {user.name}
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8F4EC] p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Email Address
                </p>

                <p className="mt-2 break-all font-semibold text-[#071A33]">
                  {user.email}
                </p>
              </div>

            </div>

            {/* Account Activity */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-[#071A33]">
                Account Activity
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">

                <Link
                  href="/orders"
                  className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">📦</span>

                    <span className="text-xl text-[#B8892D] transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>

                  <p className="mt-4 text-lg font-bold text-[#071A33]">
                    My Orders
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    View your orders
                  </p>
                </Link>

                <Link
                  href="/wishlist"
                  className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">♡</span>

                    <span className="text-xl text-[#B8892D] transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>

                  <p className="mt-4 text-lg font-bold text-[#071A33]">
                    Wishlist
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {wishlist.length} saved item
                    {wishlist.length !== 1 ? "s" : ""}
                  </p>
                </Link>

                <Link
                  href="/cart"
                  className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">🛒</span>

                    <span className="text-xl text-[#B8892D] transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>

                  <p className="mt-4 text-lg font-bold text-[#071A33]">
                    Cart
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {cartCount} item{cartCount !== 1 ? "s" : ""}
                  </p>
                </Link>

              </div>
            </div>

            {/* Sign Out */}
            <div className="mt-8 border-t border-gray-100 pt-8">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-full border border-red-200 px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}