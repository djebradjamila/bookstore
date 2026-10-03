"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Heart,
  Trash2,
  RefreshCw,
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
  const [wishlists, setWishlists] =
    useState<WishlistItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [deleting, setDeleting] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  // =====================================================
  // LOAD WISHLISTS
  // =====================================================

  const loadWishlists = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/wishlist",
        {
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to load wishlist."
        );
      }

      setWishlists(
        data.wishlists || []
      );
    } catch (error) {
      console.error(
        "Admin wishlist error:",
        error
      );

      setError(
        "Unable to load wishlist data."
      );
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
    const confirmed =
      window.confirm(
        `Remove "${bookTitle}" from this wishlist?`
      );

    if (!confirmed) {
      return;
    }

    const deleteKey =
      `${userEmail}-${bookTitle}`;

    try {
      setDeleting(deleteKey);

      const response = await fetch(
        "/api/admin/wishlist",
        {
          method: "DELETE",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            userEmail,
            bookTitle,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to delete wishlist entry."
        );
      }

      setWishlists((current) =>
        current.filter(
          (item) =>
            !(
              item.userEmail ===
                userEmail &&
              item.bookTitle ===
                bookTitle
            )
        )
      );
    } catch (error) {
      console.error(
        "Delete wishlist error:",
        error
      );

      alert(
        "Unable to delete this wishlist entry."
      );
    } finally {
      setDeleting(null);
    }
  };

  // =====================================================
  // FORMAT USER
  // =====================================================

  const getDisplayUser = (
    userEmail: string
  ) => {
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

  const formatDate = (
    createdAt?: string
  ) => {
    if (!createdAt) {
      return "—";
    }

    const date =
      new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString(
      "en-GB",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
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
  // PAGE
  // =====================================================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8B04A]/15">
              <Heart
                size={21}
                className="text-[#B8892D]"
              />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-[#071A33]">
                Wishlist
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage customer wishlist entries
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={loadWishlists}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#071A33] transition hover:bg-gray-50"
        >
          <RefreshCw size={16} />

          Refresh
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* STAT */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Wishlist Entries
              </p>

              <p className="mt-1 text-2xl font-semibold text-[#071A33]">
                {wishlists.length}
              </p>
            </div>

            <Heart
              size={22}
              className="text-[#B8892D]"
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Users
              </p>

              <p className="mt-1 text-2xl font-semibold text-[#071A33]">
                {
                  new Set(
                    wishlists.map(
                      (item) =>
                        item.userEmail
                    )
                  ).size
                }
              </p>
            </div>

            <User
              size={22}
              className="text-[#B8892D]"
            />
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Books
              </p>

              <p className="mt-1 text-2xl font-semibold text-[#071A33]">
                {
                  new Set(
                    wishlists.map(
                      (item) =>
                        item.bookTitle
                    )
                  ).size
                }
              </p>
            </div>

            <BookOpen
              size={22}
              className="text-[#B8892D]"
            />
          </div>
        </div>
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {wishlists.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <Heart
              size={42}
              className="text-gray-300"
            />

            <h2 className="mt-4 text-lg font-semibold text-[#071A33]">
              No wishlist entries
            </h2>

            <p className="mt-1 max-w-md text-sm text-gray-500">
              Wishlist entries will appear here when visitors or users add books to their wishlist.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    User
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Book
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {wishlists.map(
                  (item, index) => {
                    const deleteKey =
                      `${item.userEmail}-${item.bookTitle}`;

                    const isVisitor =
                      item.userEmail
                        .toLowerCase()
                        .startsWith(
                          "visitor-"
                        );

                    return (
                      <tr
                        key={`${deleteKey}-${index}`}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
                      >
                        {/* USER */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#071A33]/5">
                              <User
                                size={17}
                                className="text-[#071A33]"
                              />
                            </div>

                            <div>
                              <p className="font-medium text-[#071A33]">
                                {getDisplayUser(
                                  item.userEmail
                                )}
                              </p>

                              {!isVisitor && (
                                <p className="mt-0.5 text-xs text-gray-400">
                                  {item.userEmail}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* BOOK */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8B04A]/10">
                              <BookOpen
                                size={17}
                                className="text-[#B8892D]"
                              />
                            </div>

                            <span className="font-medium text-[#071A33]">
                              {item.bookTitle}
                            </span>
                          </div>
                        </td>

                        {/* DATE */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar
                              size={16}
                            />

                            <span>
                              {formatDate(
                                item.createdAt
                              )}
                            </span>
                          </div>
                        </td>

                        {/* DELETE */}

                        <td className="px-6 py-5 text-right">
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
                            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deleting ===
                            deleteKey ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2
                                size={16}
                              />
                            )}

                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}