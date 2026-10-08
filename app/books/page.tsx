"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useWishlist } from "@/components/WishlistContext";
import { useCart } from "@/components/CartContext";

type Book = {
  id: string;
  title: string;
  author: string;
  price: number;
  category: string;
  image: string;
  description: string;
  stock: number;
};

function BooksContent() {
  const searchParams = useSearchParams();

  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  /*
   * Get category from URL.
   *
   * Examples:
   * /books
   * /books?category=History
   * /books?category=Science
   */
  const urlCategory = searchParams.get("category");

  const category = urlCategory
    ? urlCategory
    : "All";

  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/books", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch books."
          );
        }

        const formattedBooks: Book[] = (
          data.books || []
        ).map((item: any) => ({
          id:
            item.id?.S ??
            item.id ??
            "",

          title:
            item.title?.S ??
            item.title ??
            "",

          author:
            item.author?.S ??
            item.author ??
            "",

          price: Number(
            item.price?.N ??
            item.price ??
            0
          ),

          category:
            item.category?.S ??
            item.category ??
            "",

          image:
            item.image?.S ??
            item.image ??
            "",

          description:
            item.description?.S ??
            item.description ??
            "No description available for this book.",

          stock: Number(
            item.stock?.N ??
            item.stock ??
            0
          ),
        }));

        setBooks(formattedBooks);
      } catch (err) {
        console.error(
          "Error loading books:",
          err
        );

        setError(
          "Unable to load books."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  /*
   * Filter books by selected category
   * and search text.
   */
  const filteredBooks = books.filter((book) => {
    const matchesCategory =
      category === "All" ||
      book.category.trim().toLowerCase() ===
        category.trim().toLowerCase();

    const searchValue =
      search.trim().toLowerCase();

    const matchesSearch =
      !searchValue ||
      book.title
        .toLowerCase()
        .includes(searchValue) ||
      book.author
        .toLowerCase()
        .includes(searchValue) ||
      book.category
        .toLowerCase()
        .includes(searchValue);

    return (
      matchesCategory &&
      matchesSearch
    );
  });

  /*
   * Dynamic category name.
   */
  const displayedCategory =
    category === "All"
      ? "All Books"
      : category;

  /*
   * Dynamic description.
   */
  const displayedDescription =
    category === "All"
      ? "Discover books from different categories and find your next favorite read."
      : `Discover our ${category} books and find your next favorite read.`;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F4EC] px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[500px] items-center justify-center">
            <p className="text-lg text-gray-500">
              Loading books...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#F8F4EC] px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-[#071A33]">
              {error}
            </h1>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-6 rounded-full bg-[#E8B04A] px-7 py-3 font-semibold text-[#071A33] transition hover:bg-[#F3C866]"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F4EC] px-6 py-12">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#B8892D]">
            Bookstore
          </p>

          <h1 className="mt-2 text-4xl font-bold text-[#071A33] md:text-5xl">
            Our Books
          </h1>

          {/* Dynamic description */}
          <p className="mt-3 max-w-2xl text-gray-500">
            {displayedDescription}
          </p>

          {/* Dynamic category */}
          <p className="mt-4 text-sm font-semibold text-[#B8892D]">
            Category: {displayedCategory}
          </p>
        </div>

        {/* =====================================================
            SEARCH + FILTER
        ===================================================== */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search books..."
              className="w-full rounded-full border border-gray-200 bg-white py-3 pl-12 pr-5 text-sm outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
            />
          </div>

          {/* Category indicator */}
          <div className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#071A33] shadow-sm">
            <SlidersHorizontal
              size={18}
              className="text-[#B8892D]"
            />

            {displayedCategory}
          </div>
        </div>

        {/* =====================================================
            SELECTED CATEGORY
        ===================================================== */}
        {category !== "All" && (
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#E8B04A] px-5 py-2 text-sm font-semibold text-[#071A33]">
              {category}
            </span>

            <Link
              href="/books"
              className="rounded-full border border-[#071A33] px-5 py-2 text-sm font-semibold text-[#071A33] transition hover:bg-[#071A33] hover:text-white"
            >
              View All Books
            </Link>
          </div>
        )}

        {/* =====================================================
            BOOK COUNT
        ===================================================== */}
        <div className="mb-6">
          <p className="text-sm text-gray-500">
            {filteredBooks.length}{" "}
            {filteredBooks.length === 1
              ? "book"
              : "books"}{" "}
            found
          </p>
        </div>

        {/* =====================================================
            NO BOOKS
        ===================================================== */}
        {filteredBooks.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-[#071A33]">
              No books found
            </h2>

            <p className="mt-3 text-gray-500">
              There are no books matching your search
              or selected category.
            </p>

            {category !== "All" && (
              <Link
                href="/books"
                className="mt-6 inline-flex rounded-full bg-[#E8B04A] px-7 py-3 font-semibold text-[#071A33] transition hover:bg-[#F3C866]"
              >
                View All Books
              </Link>
            )}
          </div>
        ) : (
          /* =====================================================
             BOOK GRID
          ===================================================== */
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBooks.map((book) => {
              const isOutOfStock =
                book.stock <= 0;

              const isWishlisted =
                wishlist.includes(book.title);

              return (
                <article
                  key={book.id}
                  className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >

                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={
                        book.image ||
                        "/books/default.jpg"
                      }
                      alt={book.title}
                      className={`h-80 w-full object-cover transition duration-500 ${
                        isOutOfStock
                          ? "grayscale opacity-60"
                          : "group-hover:scale-105"
                      }`}
                      onError={(event) => {
                        event.currentTarget.src =
                          "/books/default.jpg";
                      }}
                    />

                    {/* Wishlist */}
                    <button
                      type="button"
                      onClick={() =>
                        toggleWishlist(
                          book.title
                        )
                      }
                      aria-label={
                        isWishlisted
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                      className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-110"
                    >
                      <Heart
                        size={21}
                        className={
                          isWishlisted
                            ? "fill-red-500 text-red-500"
                            : "text-[#071A33]"
                        }
                      />
                    </button>

                    {/* Category */}
                    <div className="absolute bottom-4 left-4 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#071A33]">
                      {book.category}
                    </div>

                    {/* Out of stock */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="rounded-full bg-red-600 px-5 py-2 text-sm font-bold text-white shadow-lg">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Information */}
                  <div className="p-6">

                    <h2 className="line-clamp-2 text-xl font-bold text-[#071A33]">
                      {book.title}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      by {book.author}
                    </p>

                    <p className="mt-4 text-2xl font-bold text-[#B8892D]">
                      {book.price.toLocaleString()} DZD
                    </p>

                    {/* Availability */}
                    <p
                      className={`mt-3 text-sm font-bold ${
                        isOutOfStock
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {isOutOfStock
                        ? "Out of Stock"
                        : "In Stock"}
                    </p>

                    {/* Buttons */}
                    <div className="mt-5 flex flex-col gap-2">

                      {/* Add to Cart */}
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => {
                          if (
                            isOutOfStock
                          ) {
                            return;
                          }

                          addToCart({
                            id: book.id,
                            title: book.title,
                            author: book.author,
                            price: book.price,
                            image: book.image,
                          });
                        }}
                        className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
                          isOutOfStock
                            ? "cursor-not-allowed bg-gray-200 text-gray-400"
                            : "bg-[#E8B04A] text-[#071A33] hover:bg-[#F3C866]"
                        }`}
                      >
                        <ShoppingCart size={18} />

                        {isOutOfStock
                          ? "Out of Stock"
                          : "Add to Cart"}
                      </button>

                      {/* View Book */}
                      <Link
                        href={`/book?title=${encodeURIComponent(
                          book.title
                        )}`}
                        className="flex w-full items-center justify-center rounded-full bg-[#071A33] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E8B04A] hover:text-[#071A33]"
                      >
                        View Book
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function BooksLoading() {
  return (
    <main className="min-h-screen bg-[#F8F4EC] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex min-h-[500px] items-center justify-center">
          <p className="text-lg text-gray-500">
            Loading books...
          </p>
        </div>
      </div>
    </main>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={<BooksLoading />}>
      <BooksContent />
    </Suspense>
  );
}