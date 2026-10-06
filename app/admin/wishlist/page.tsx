
"use client";

import { useEffect, useState } from "react";

import {
  Heart,
  Trash2,
  User,
  BookOpen,
  Calendar,
  Loader2,
} from "lucide-react";

type WishlistItem = {
  userEmail: string;
  bookTitle: string;
  createdAt?: string;
};

export default function AdminWishlistPage() {
  const [wishlists, setWishlists] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD WISHLISTS
  // =====================================================

  const loadWishlists = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/wishlist", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to load wishlist."
        );
      }

      setWishlists(data.wishlists || []);
    } catch (error) {
      console.error("Admin wishlist error:", error);

      setError("Unable to load wishlist data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlists();
  }, []);

  // =====================================================
  // DELETE WISHLIST
  // =====================================================

  const deleteWishlist = async (
    userEmail: string,
    bookTitle: string
  ) => {
    const confirmed = window.confirm(
      `Remove "${bookTitle}" from this wishlist?`
    );

    if (!confirmed) {
      return;
    }

    const deleteKey = `${userEmail}-${bookTitle}`;

    try {
      setDeleting(deleteKey);

      const response = await fetch("/api/admin/wishlist", {
        method: "DELETE",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          userEmail,
          bookTitle,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to delete wishlist entry."
        );
      }

      setWishlists((current) =>
        current.filter(
          (item) =>
            !(
              item.userEmail === userEmail &&
              item.bookTitle === bookTitle
            )
        )
      );
    } catch (error) {
      console.error("Delete wishlist error:", error);

      alert("Unable to delete this wishlist entry.");
    } finally {
      setDeleting(null);
    }
  };

  // =====================================================
  // FORMAT USER
  // =====================================================

  const getDisplayUser = (userEmail: string) => {
    if (
      userEmail
        .toLowerCase()
        .startsWith("visitor-")
    ) {
      return "Visitor";
    }

    return userEmail;
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (createdAt?: string) => {
    if (!createdAt) {
      return "—";
    }

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-[#071A33]">
          <Loader2
            className="animate-spin"
            size={22}
          />

          <span className="text-sm">
            Loading wishlist...
          </span>
        </div>
      </div>
    );
  }

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalUsers = new Set(
    wishlists.map((item) => item.userEmail)
  ).size;

  const totalBooks = new Set(
    wishlists.map((item) => item.bookTitle)
  ).size;

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="space-y-5">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8B04A]/15">
          <Heart
            size={19}
            className="text-[#B8892D]"
          />
        </div>

        <div>
          <h1 className="text-xl font-semibold text-[#071A33] sm:text-2xl">
            Wishlist
          </h1>

          <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
            Manage customer wishlist entries
          </p>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* WISHLIST ENTRIES */}

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                Wishlist Entries
              </p>

              <p className="mt-1 text-xl font-semibold text-[#071A33]">
                {wishlists.length}
              </p>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8B04A]/10">
              <Heart
                size={17}
                className="text-[#B8892D]"
              />
            </div>
          </div>
        </div>

        {/* USERS */}

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                Users
              </p>

              <p className="mt-1 text-xl font-semibold text-[#071A33]">
                {totalUsers}
              </p>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <User
                size={17}
                className="text-blue-700"
              />
            </div>
          </div>
        </div>

        {/* BOOKS */}

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                Books
              </p>

              <p className="mt-1 text-xl font-semibold text-[#071A33]">
                {totalBooks}
              </p>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
              <BookOpen
                size={17}
                className="text-green-700"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {wishlists.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
              <Heart
                size={32}
                className="text-gray-300"
              />
            </div>

            <h2 className="mt-4 text-base font-semibold text-[#071A33]">
              No wishlist entries
            </h2>

            <p className="mt-1 max-w-md text-xs text-gray-500 sm:text-sm">
              Wishlist entries will appear here when
              visitors or users add books to their
              wishlist.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* =================================================
              MOBILE CARDS
          ================================================= */}

          <div className="space-y-2.5 md:hidden">
            {wishlists.map((item, index) => {
              const deleteKey =
                `${item.userEmail}-${item.bookTitle}`;

              const isVisitor =
                item.userEmail
                  .toLowerCase()
                  .startsWith("visitor-");

              return (
                <div
                  key={`${deleteKey}-${index}`}
                  className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
                >
                  {/* USER */}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#071A33]/5">
                        <User
                          size={15}
                          className="text-[#071A33]"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-[#071A33]">
                          {getDisplayUser(
                            item.userEmail
                          )}
                        </p>

                        {!isVisitor && (
                          <p className="truncate text-[10px] text-gray-400">
                            {item.userEmail}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        deleteWishlist(
                          item.userEmail,
                          item.bookTitle
                        )
                      }
                      disabled={
                        deleting === deleteKey
                      }
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                      title="Delete"
                    >
                      {deleting === deleteKey ? (
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>

                  {/* BOOK */}

                  <div className="mt-3 flex items-center gap-2.5 rounded-lg bg-[#F8F4EC]/60 p-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E8B04A]/10">
                      <BookOpen
                        size={15}
                        className="text-[#B8892D]"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-[#071A33]">
                        {item.bookTitle}
                      </p>
                    </div>
                  </div>

                  {/* DATE */}

                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-400">
                    <Calendar size={12} />

                    <span>
                      {formatDate(
                        item.createdAt
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* =================================================
              DESKTOP COMPACT TABLE
          ================================================= */}

          <div className="hidden overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="w-[31%] px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      User
                    </th>

                    <th className="w-[31%] px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      Book
                    </th>

                    <th className="w-[23%] px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      Date
                    </th>

                    <th className="w-[15%] px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {wishlists.map((item, index) => {
                    const deleteKey =
                      `${item.userEmail}-${item.bookTitle}`;

                    const isVisitor =
                      item.userEmail
                        .toLowerCase()
                        .startsWith("visitor-");

                    return (
                      <tr
                        key={`${deleteKey}-${index}`}
                        className="border-b border-gray-100 last:border-0 transition hover:bg-gray-50/50"
                      >
                        {/* USER */}

                        <td className="px-4 py-2.5">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#071A33]/5">
                              <User
                                size={13}
                                className="text-[#071A33]"
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-[11px] font-semibold text-[#071A33]">
                                {getDisplayUser(
                                  item.userEmail
                                )}
                              </p>

                              {!isVisitor && (
                                <p className="truncate text-[9px] text-gray-400">
                                  {item.userEmail}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* BOOK */}

                        <td className="px-4 py-2.5">
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E8B04A]/10">
                              <BookOpen
                                size={13}
                                className="text-[#B8892D]"
                              />
                            </div>

                            <span className="truncate text-[11px] font-medium text-[#071A33]">
                              {item.bookTitle}
                            </span>
                          </div>
                        </td>

                        {/* DATE */}

                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                            <Calendar
                              size={12}
                              className="shrink-0"
                            />

                            <span className="truncate">
                              {formatDate(
                                item.createdAt
                              )}
                            </span>
                          </div>
                        </td>

                        {/* DELETE */}

                        <td className="px-4 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              deleteWishlist(
                                item.userEmail,
                                item.bookTitle
                              )
                            }
                            disabled={
                              deleting ===
                              deleteKey
                            }
                            className="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[10px] font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deleting ===
                            deleteKey ? (
                              <Loader2
                                size={12}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2
                                size={12}
                              />
                            )}

                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
