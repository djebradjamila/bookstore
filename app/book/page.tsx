"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  ArrowLeft,
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

function BookDetails() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const title = searchParams.get("title");

  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBook() {
      try {
        setLoading(true);
        setError("");

        if (!title) {
          setError("Book not found.");
          return;
        }

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

        /*
         * Decode the URL title safely.
         */
        const decodedTitle = decodeURIComponent(title);

        const foundBook = formattedBooks.find(
          (item) =>
            item.title.trim().toLowerCase() ===
            decodedTitle.trim().toLowerCase()
        );

        if (!foundBook) {
          setError("Book not found.");
          return;
        }

        setBook(foundBook);

        /*
         * =====================================================
         * RELATED BOOKS
         * =====================================================
         * Display only other books belonging to the
         * same category as the current book.
         *
         * The current book itself is excluded.
         * Category comparison is case-insensitive.
         */
        const sameCategoryBooks = formattedBooks.filter(
          (item) =>
            item.id !== foundBook.id &&
            item.title.trim().toLowerCase() !==
              foundBook.title.trim().toLowerCase() &&
            item.category.trim().toLowerCase() ===
              foundBook.category.trim().toLowerCase()
        );

        setRelatedBooks(sameCategoryBooks);
      } catch (error) {
        console.error(
          "Error loading book:",
          error
        );

        setError(
          "Unable to load the book."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [title]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F4EC] px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex min-h-[500px] items-center justify-center">
            <p className="text-lg text-gray-500">
              Loading book...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !book) {
    return (
      <main className="min-h-screen bg-[#F8F4EC] px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <h1 className="text-3xl font-bold text-[#071A33]">
              {error || "Book not found"}
            </h1>

            <p className="mt-3 text-gray-500">
              The book could not be loaded.
            </p>

            <Link
              href="/books"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#E8B04A] px-7 py-3 font-semibold text-[#071A33] transition hover:bg-[#F3C866]"
            >
              <ArrowLeft size={18} />
              Back to Books
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isOutOfStock = book.stock <= 0;

  const isWishlisted =
    wishlist.includes(book.title);

  return (
    <main className="min-h-screen bg-[#F8F4EC] px-6 py-12">
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#071A33] transition hover:text-[#B8892D]"
        >
          <ArrowLeft size={18} />
          Back to Books
        </button>

        {/* =====================================================
            BOOK DETAILS
        ===================================================== */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="grid md:grid-cols-2">

            {/* Image */}
            <div className="relative min-h-[500px] overflow-hidden bg-gray-100">
              <img
                src={
                  book.image ||
                  "/books/default.jpg"
                }
                alt={book.title}
                className={`h-full min-h-[500px] w-full object-cover ${
                  isOutOfStock
                    ? "grayscale opacity-60"
                    : ""
                }`}
                onError={(event) => {
                  event.currentTarget.src =
                    "/books/default.jpg";
                }}
              />

              {/* Wishlist button */}
              <button
                type="button"
                onClick={() =>
                  toggleWishlist(book.title)
                }
                aria-label={
                  isWishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-110"
              >
                <Heart
                  size={23}
                  className={
                    isWishlisted
                      ? "fill-red-500 text-red-500"
                      : "text-[#071A33]"
                  }
                />
              </button>

              {/* Out of stock */}
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="rounded-full bg-red-600 px-6 py-3 text-base font-bold text-white shadow-lg">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col justify-center p-8 md:p-12">

              {/* Category */}
              {book.category && (
                <span className="mb-4 w-fit rounded-full bg-[#F8F4EC] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#B8892D]">
                  {book.category}
                </span>
              )}

              {/* Title */}
              <h1 className="text-4xl font-bold leading-tight text-[#071A33] md:text-5xl">
                {book.title}
              </h1>

              {/* Author */}
              <p className="mt-4 text-lg text-gray-500">
                by{" "}
                <span className="font-semibold text-[#071A33]">
                  {book.author}
                </span>
              </p>

              {/* Price */}
              <p className="mt-8 text-3xl font-bold text-[#B8892D]">
                {book.price.toLocaleString()} DZD
              </p>

              {/* Availability */}
              <div className="mt-6 border-y border-gray-100 py-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Availability
                </p>

                <p
                  className={`mt-2 text-lg font-bold ${
                    isOutOfStock
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {isOutOfStock
                    ? "Out of Stock"
                    : "In Stock"}
                </p>
              </div>

              {/* Description */}
              <div className="mt-7">
                <h2 className="text-lg font-bold text-[#071A33]">
                  About this book
                </h2>

                <p className="mt-3 leading-7 text-gray-600">
                  {book.description}
                </p>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => {
                  if (isOutOfStock) {
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
                className={`mt-8 flex w-full items-center justify-center gap-3 rounded-full px-6 py-4 text-base font-bold transition ${
                  isOutOfStock
                    ? "cursor-not-allowed bg-gray-200 text-gray-400"
                    : "bg-[#E8B04A] text-[#071A33] hover:bg-[#F3C866]"
                }`}
              >
                <ShoppingCart size={21} />

                {isOutOfStock
                  ? "Out of Stock"
                  : "Add to Cart"}
              </button>

              {/* Wishlist */}
              <button
                type="button"
                onClick={() =>
                  toggleWishlist(book.title)
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-[#071A33] px-6 py-4 font-semibold text-[#071A33] transition hover:bg-[#071A33] hover:text-white"
              >
                <Heart
                  size={19}
                  className={
                    isWishlisted
                      ? "fill-red-500 text-red-500"
                      : ""
                  }
                />

                {isWishlisted
                  ? "Remove from Wishlist"
                  : "Add to Wishlist"}
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================
            BOOKS FROM THE SAME CATEGORY
        ===================================================== */}
        {relatedBooks.length > 0 && (
          <section className="mt-14">

            {/* Section title */}
            <div className="mb-7">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#B8892D]">
                More to discover
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#071A33]">
                More books in {book.category}
              </h2>

              <p className="mt-2 text-gray-500">
                Discover other books from the same category.
              </p>
            </div>

            {/* Related books */}
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {relatedBooks.map((relatedBook) => {
                const relatedIsOutOfStock =
                  relatedBook.stock <= 0;

                const relatedIsWishlisted =
                  wishlist.includes(
                    relatedBook.title
                  );

                return (
                  <article
                    key={relatedBook.id}
                    className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >

                    {/* Image */}
                    <div className="relative overflow-hidden">
                      <img
                        src={
                          relatedBook.image ||
                          "/books/default.jpg"
                        }
                        alt={relatedBook.title}
                        className={`h-72 w-full object-cover transition duration-500 ${
                          relatedIsOutOfStock
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
                            relatedBook.title
                          )
                        }
                        aria-label={
                          relatedIsWishlisted
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-110"
                      >
                        <Heart
                          size={21}
                          className={
                            relatedIsWishlisted
                              ? "fill-red-500 text-red-500"
                              : "text-[#071A33]"
                          }
                        />
                      </button>

                      {/* Category */}
                      <div className="absolute bottom-4 left-4 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#071A33]">
                        {relatedBook.category}
                      </div>

                      {/* Out of stock */}
                      {relatedIsOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="rounded-full bg-red-600 px-5 py-2 text-sm font-bold text-white shadow-lg">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Information */}
                    <div className="p-6">

                      <h3 className="line-clamp-2 text-xl font-bold text-[#071A33]">
                        {relatedBook.title}
                      </h3>

                      <p className="mt-2 text-sm text-gray-500">
                        by {relatedBook.author}
                      </p>

                      <p className="mt-4 text-2xl font-bold text-[#B8892D]">
                        {relatedBook.price.toLocaleString()} DZD
                      </p>

                      {/* Availability */}
                      <p
                        className={`mt-3 text-sm font-bold ${
                          relatedIsOutOfStock
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {relatedIsOutOfStock
                          ? "Out of Stock"
                          : "In Stock"}
                      </p>

                      {/* Buttons */}
                      <div className="mt-5 flex flex-col gap-2">

                        {/* Add to Cart */}
                        <button
                          type="button"
                          disabled={relatedIsOutOfStock}
                          onClick={() => {
                            if (
                              relatedIsOutOfStock
                            ) {
                              return;
                            }

                            addToCart({
                              id: relatedBook.id,
                              title: relatedBook.title,
                              author: relatedBook.author,
                              price: relatedBook.price,
                              image: relatedBook.image,
                            });
                          }}
                          className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
                            relatedIsOutOfStock
                              ? "cursor-not-allowed bg-gray-200 text-gray-400"
                              : "bg-[#E8B04A] text-[#071A33] hover:bg-[#F3C866]"
                          }`}
                        >
                          <ShoppingCart size={18} />

                          {relatedIsOutOfStock
                            ? "Out of Stock"
                            : "Add to Cart"}
                        </button>

                        {/* View Book */}
                        <Link
                          href={`/book?title=${encodeURIComponent(
                            relatedBook.title
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
          </section>
        )}
      </div>
    </main>
  );
}

function BookPageLoading() {
  return (
    <main className="min-h-screen bg-[#F8F4EC] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex min-h-[500px] items-center justify-center">
          <p className="text-lg text-gray-500">
            Loading book...
          </p>
        </div>
      </div>
    </main>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<BookPageLoading />}>
      <BookDetails />
    </Suspense>
  );
}