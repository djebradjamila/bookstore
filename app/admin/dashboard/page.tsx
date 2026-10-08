"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  ShoppingCart,
  Wallet,
  Heart,
  Mail,
  PackageX,
  ArrowRight,
  Loader2,
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

  const [totalMessages, setTotalMessages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] =
    useState(true);

  const [error, setError] = useState("");

  // =========================================================
  // LOAD DASHBOARD DATA
  // =========================================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setMessagesLoading(true);
        setError("");

        const [statsResponse, messagesResponse] =
          await Promise.all([
            fetch("/api/admin/stats", {
              cache: "no-store",
            }),
            fetch("/api/contact", {
              cache: "no-store",
            }),
          ]);

        // =====================================================
        // STATISTICS
        // =====================================================

        if (!statsResponse.ok) {
          throw new Error(
            "Failed to load dashboard statistics"
          );
        }

        const statsData =
          await statsResponse.json();

        if (!statsData.success) {
          throw new Error(
            statsData.message ||
              "Failed to load dashboard statistics"
          );
        }

        setStats({
          totalBooks: Number(
            statsData.stats?.totalBooks || 0
          ),

          totalUsers: Number(
            statsData.stats?.totalUsers || 0
          ),

          totalOrders: Number(
            statsData.stats?.totalOrders || 0
          ),

          totalWishlist: Number(
            statsData.stats?.totalWishlist || 0
          ),

          revenue: Number(
            statsData.stats?.revenue || 0
          ),

          lowStock: Number(
            statsData.stats?.lowStock || 0
          ),

          outOfStock: Number(
            statsData.stats?.outOfStock || 0
          ),
        });

        // =====================================================
        // CONTACT MESSAGES
        // =====================================================

        if (messagesResponse.ok) {
          const messagesData =
            await messagesResponse.json();

          let messages: any[] = [];

          if (Array.isArray(messagesData)) {
            messages = messagesData;
          } else if (
            Array.isArray(messagesData.contacts)
          ) {
            messages = messagesData.contacts;
          } else if (
            Array.isArray(messagesData.messages)
          ) {
            messages = messagesData.messages;
          }

          setTotalMessages(messages.length);
        } else {
          setTotalMessages(0);
        }
      } catch (err) {
        console.error("Dashboard error:", err);

        setError(
          "Unable to load dashboard statistics."
        );
      } finally {
        setLoading(false);
        setMessagesLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // =========================================================
  // STAT CARDS
  // =========================================================

  const statCards = [
    {
      title: "Total Books",
      value: stats.totalBooks,
      icon: BookOpen,
      href: "/admin/products",
      description: "Books in store",
    },

    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      href: "/admin/users",
      description: "Registered users",
    },

    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      href: "/admin/orders",
      description: "Customer orders",
    },

    {
      title: "Total Wishlist",
      value: stats.totalWishlist,
      icon: Heart,
      href: "/admin/wishlist",
      description: "Wishlist items",
    },

    {
      title: "Revenue",
      value: `${stats.revenue.toLocaleString()} DZD`,
      icon: Wallet,
      href: "/admin/orders",
      description: "Confirmed orders",
    },

    {
      title: "Messages",
      value: totalMessages,
      icon: Mail,
      href: "/admin/contact",
      description: "Contact messages",
    },

    // =====================================================
    // OUT OF STOCK
    // Replaces Low Stock card
    // =====================================================

    {
      title: "Out of Stock",
      value: stats.outOfStock,
      icon: PackageX,
      href: "/admin/products",
      description: "Books out of stock",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F4EC] px-3 py-4 text-[#071A33] sm:px-5 sm:py-6 lg:px-6">
      <div className="mx-auto max-w-[1450px]">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[#071A33] sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Overview of your BookStore.
          </p>
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* =====================================================
            MAIN STATISTICS
        ===================================================== */}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {statCards.map((card) => {
            const Icon = card.icon;

            const isMessage =
              card.title === "Messages";

            const isLoading =
              loading ||
              (isMessage && messagesLoading);

            return (
              <Link
                key={card.title}
                href={card.href}
                className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#E8B04A] hover:shadow-md"
              >
                {/* ICON */}

                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F8F4EC]">
                    <Icon
                      size={18}
                      className="text-[#B8892D]"
                    />
                  </div>

                  <ArrowRight
                    size={14}
                    className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#B8892D]"
                  />
                </div>

                {/* TITLE */}

                <p className="mt-4 truncate text-[11px] font-medium text-slate-500 sm:text-xs">
                  {card.title}
                </p>

                {/* VALUE */}

                <div className="mt-1 min-h-[30px]">
                  {isLoading ? (
                    <Loader2
                      size={19}
                      className="mt-1 animate-spin text-[#B8892D]"
                    />
                  ) : (
                    <p
                      className={`truncate font-bold text-[#071A33] ${
                        card.title === "Revenue"
                          ? "text-lg sm:text-xl"
                          : "text-2xl"
                      }`}
                    >
                      {card.value}
                    </p>
                  )}
                </div>

                {/* DESCRIPTION */}

                <p className="mt-1 truncate text-[10px] text-slate-400">
                  {card.description}
                </p>
              </Link>
            );
          })}
        </div>

        {/* =====================================================
            STOCK ALERT
        ===================================================== */}

        {!loading &&
          (stats.lowStock > 0 ||
            stats.outOfStock > 0) && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start gap-3">

                {/* ICON */}

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8F4EC]">
                  {stats.outOfStock > 0 ? (
                    <PackageX
                      size={19}
                      className="text-red-500"
                    />
                  ) : (
                    <PackageX
                      size={19}
                      className="text-[#B8892D]"
                    />
                  )}
                </div>

                {/* CONTENT */}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-[#071A33]">
                        Stock Alert
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        Some products need your attention.
                      </p>
                    </div>

                    <Link
                      href="/admin/products"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#B8892D] hover:underline"
                    >
                      Manage Products
                      <ArrowRight size={13} />
                    </Link>
                  </div>

                  {/* ALERT DETAILS */}

                  <div className="mt-3 flex flex-wrap gap-2">

                    {stats.outOfStock > 0 && (
                      <div className="rounded-lg bg-red-50 px-3 py-2 text-xs">
                        <span className="font-bold text-red-600">
                          {stats.outOfStock}
                        </span>{" "}
                        <span className="text-red-700">
                          {stats.outOfStock === 1
                            ? "book is"
                            : "books are"}{" "}
                          out of stock
                        </span>
                      </div>
                    )}

                    {stats.lowStock > 0 && (
                      <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs">
                        <span className="font-bold text-[#B8892D]">
                          {stats.lowStock}
                        </span>{" "}
                        <span className="text-amber-800">
                          {stats.lowStock === 1
                            ? "book has"
                            : "books have"}{" "}
                          low stock
                        </span>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>
          )}

        {/* =====================================================
            FOOTER / STATUS
        ===================================================== */}

        <div className="mt-5 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-slate-400">
            BookStore Administration
          </p>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Dashboard active
          </div>
        </div>

      </div>
    </div>
  );
}