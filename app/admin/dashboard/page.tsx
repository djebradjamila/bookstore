"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Stats = {
  totalBooks: number;
  totalUsers: number;
  totalOrders: number;
  revenue: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    totalUsers: 0,
    totalOrders: 0,
    revenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");

        if (!response.ok) {
          throw new Error("Failed to load statistics");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to load statistics");
        }

        setStats(data.stats);
      } catch (error) {
        console.error("Dashboard stats error:", error);
        setError("Unable to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="min-h-screen p-6 md:p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

        {/* Books */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Books
              </p>

              <p className="mt-2 text-3xl font-bold">
                {loading ? "..." : stats.totalBooks}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F8F4EC] text-2xl">
              📚
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Users
              </p>

              <p className="mt-2 text-3xl font-bold">
                {loading ? "..." : stats.totalUsers}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F8F4EC] text-2xl">
              👥
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Orders
              </p>

              <p className="mt-2 text-3xl font-bold">
                {loading ? "..." : stats.totalOrders}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F8F4EC] text-2xl">
              🛒
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Revenue
              </p>

              <p className="mt-2 text-3xl font-bold">
                {loading
                  ? "..."
                  : `${stats.revenue.toLocaleString()} DZD`}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F8F4EC] text-2xl">
              💰
            </div>
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">

        <h2 className="text-xl font-semibold">
          Quick Actions
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <Link
            href="/admin/products"
            className="rounded-lg border border-gray-200 p-4 transition hover:border-[#E8B04A] hover:bg-[#F8F4EC]"
          >
            <p className="font-semibold">
              📚 Manage Products
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Add, edit or delete books.
            </p>
          </Link>

          <Link
            href="/admin/categories"
            className="rounded-lg border border-gray-200 p-4 transition hover:border-[#E8B04A] hover:bg-[#F8F4EC]"
          >
            <p className="font-semibold">
              🏷️ Manage Categories
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Manage book categories.
            </p>
          </Link>

          <Link
            href="/admin/users"
            className="rounded-lg border border-gray-200 p-4 transition hover:border-[#E8B04A] hover:bg-[#F8F4EC]"
          >
            <p className="font-semibold">
              👥 Manage Users
            </p>

            <p className="mt-1 text-sm text-gray-500">
              View and manage users.
            </p>
          </Link>

          <Link
            href="/admin/orders"
            className="rounded-lg border border-gray-200 p-4 transition hover:border-[#E8B04A] hover:bg-[#F8F4EC]"
          >
            <p className="font-semibold">
              🛒 Manage Orders
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