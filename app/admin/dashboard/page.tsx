
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  ShoppingCart,
  Wallet,
  AlertTriangle,
  PackageX,
  Heart,
  ArrowRight,
} from "lucide-react";

type Stats = {
  totalBooks: number;
  totalUsers: number;
  totalOrders: number;
  totalWishlist: number;
  revenue: number;
  lowStock: number;
  outOfStock: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalWishlist: 0,
    revenue: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/stats");

        if (!response.ok) {
          throw new Error("Failed to load statistics");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.message || "Failed to load statistics"
          );
        }

        setStats(data.stats);
      } catch (error) {
        console.error("Dashboard stats error:", error);
        setError(
          "Unable to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const statCards = [
    {
      title: "Total Books",
      value: stats.totalBooks,
      icon: BookOpen,
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
    },
    {
      title: "Total Wishlist",
      value: stats.totalWishlist,
      icon: Heart,
    },
    {
      title: "Revenue",
      value: `${stats.revenue.toLocaleString()} DZD`,
      icon: Wallet,
    },
    {
      title: "Low Stock",
      value: stats.lowStock,
      icon: AlertTriangle,
    },
    {
      title: "Out of Stock",
      value: stats.outOfStock,
      icon: PackageX,
    },
  ];

  return (
    <div className="min-h-screen p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#071A33]">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Welcome to your BookStore administration panel.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {card.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-[#071A33]">
                    {loading ? "..." : card.value}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F8F4EC]">
                  <Icon
                    size={23}
                    className="text-[#B8892D]"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Wishlist */}
      {!loading && (
        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F8F4EC]">
              <Heart
                size={21}
                className="text-[#B8892D]"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#071A33]">
                Wishlist
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                There are currently{" "}
                <span className="font-semibold text-[#071A33]">
                  {stats.totalWishlist}
                </span>{" "}
                wishlist{" "}
                {stats.totalWishlist === 1
                  ? "item"
                  : "items"}.
              </p>

              <Link
                href="/admin/wishlist"
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#B8892D] hover:underline"
              >
                Manage Wishlist
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stock Warning */}
      {!loading &&
        (stats.lowStock > 0 ||
          stats.outOfStock > 0) && (
          <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F8F4EC]">
                <AlertTriangle
                  size={21}
                  className="text-[#B8892D]"
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[#071A33]">
                  Stock Alert
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  {stats.outOfStock > 0 &&
                    `${stats.outOfStock} book${
                      stats.outOfStock > 1
                        ? "s are"
                        : " is"
                    } out of stock.`}

                  {stats.outOfStock > 0 &&
                    stats.lowStock > 0 &&
                    " "}

                  {stats.lowStock > 0 &&
                    `${stats.lowStock} book${
                      stats.lowStock > 1
                        ? "s have"
                        : " has"
                    } low stock.`}
                </p>

                <Link
                  href="/admin/products"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#B8892D] hover:underline"
                >
                  Manage Products
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        )}

      {/* Quick Actions */}
      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[#071A33]">
          Quick Actions
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/products"
            className="group rounded-lg border border-gray-200 p-4 transition hover:border-[#E8B04A] hover:bg-[#F8F4EC]"
          >
            <div className="flex items-center justify-between">
              <BookOpen
                size={20}
                className="text-[#B8892D]"
              />

              <ArrowRight
                size={17}
                className="text-gray-400 transition group-hover:translate-x-1"
              />
            </div>

            <p className="mt-3 font-semibold text-[#071A33]">
              Manage Products
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Add, edit or delete books.
            </p>
          </Link>

          <Link
            href="/admin/categories"
            className="group rounded-lg border border-gray-200 p-4 transition hover:border-[#E8B04A] hover:bg-[#F8F4EC]"
          >
            <div className="flex items-center justify-between">
              <BookOpen
                size={20}
                className="text-[#B8892D]"
              />

              <ArrowRight
                size={17}
                className="text-gray-400 transition group-hover:translate-x-1"
              />
            </div>

            <p className="mt-3 font-semibold text-[#071A33]">
              Manage Categories
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Manage book categories.
            </p>
          </Link>

          <Link
            href="/admin/users"
            className="group rounded-lg border border-gray-200 p-4 transition hover:border-[#E8B04A] hover:bg-[#F8F4EC]"
          >
            <div className="flex items-center justify-between">
              <Users
                size={20}
                className="text-[#B8892D]"
              />

              <ArrowRight
                size={17}
                className="text-gray-400 transition group-hover:translate-x-1"
              />
            </div>

            <p className="mt-3 font-semibold text-[#071A33]">
              Manage Users
            </p>

            <p className="mt-1 text-sm text-gray-500">
              View and manage users.
            </p>
          </Link>

          <Link
            href="/admin/orders"
            className="group rounded-lg border border-gray-200 p-4 transition hover:border-[#E8B04A] hover:bg-[#F8F4EC]"
          >
            <div className="flex items-center justify-between">
              <ShoppingCart
                size={20}
                className="text-[#B8892D]"
              />

              <ArrowRight
                size={17}
                className="text-gray-400 transition group-hover:translate-x-1"
              />
            </div>

            <p className="mt-3 font-semibold text-[#071A33]">
              Manage Orders
            </p>

            <p className="mt-1 text-sm text-gray-500">
              View and manage orders.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
