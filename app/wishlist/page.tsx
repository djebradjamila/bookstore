"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWishlist } from "@/components/WishlistContext";
import { useCart } from "@/components/CartContext";

type Book = {
  id: string;
  title: string;
  author: string;
  price: number;
  category: string;
  image: string;
  stock: number;
};

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(
          `${window.location.origin}/api/books`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch books"
          );
        }

        const formattedBooks: Book[] = data.books.map(
          (book: any) => ({
            id: book.id?.S || book.id || "",
            title: book.title?.S || book.title || "",
            author: book.author?.S || book.author || "",
            price: Number(book.price?.N || book.price || 0),
            category:
              book.category?.S || book.category || "",
            image: book.image?.S || book.image || "",
            stock: Number(
              book.stock?.N || book.stock || 0
            ),
          })
        );

        setBooks(formattedBooks);
      } catch (err) {
        console.error(err);
        setError("Unable to load wishlist books.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const wishlistBooks = books.filter((book) =>
    wishlist.includes(book.title)
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F4EC] px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[400px] items-center justify-center">
            <p className="text-lg text-gray-500">
              Loading wishlist...
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
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="font-semibold text-red-700">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F4EC] px-6 py-12">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#B8892D]">
            Saved for later
          </p>

          <h1 className="text-4xl font-bold text-[#071A33] md:text-5xl">
            My Wishlist
          </h1>

          <p className="mt-3 text-gray-600">
            {wishlistBooks.length} book
            {wishlistBooks.length !== 1 ? "s" : ""} saved
            in your wishlist.
          </p>
        </div>

        {/* Empty wishlist */}
        {wishlistBooks.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <div className="mb-5 text-6xl">♡</div>

            <h2 className="text-2xl font-bold text-[#071A33]">
              Your wishlist is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-gray-500">
              Save your favorite books here and come back
              whenever you are ready.
            </p>

            <Link
              href="/books"
              className="mt-7 inline-flex rounded-full bg-[#E8B04A] px-7 py-3 font-semibold text-[#071A33] transition hover:bg-[#F3C866]"
            >
              Explore Books
            </Link>
          </div>
        ) : (
          /* Wishlist books */
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {wishlistBooks.map((book) => {
              const isOutOfStock = book.stock <= 0;

              return (
                <div
                  key={book.id}
                  className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={book.image || "/books/default.jpg"}
                      alt={book.title}
                      className={`h-72 w-full object-cover transition duration-500 ${
                        isOutOfStock
                          ? "grayscale opacity-60"
                          : "group-hover:scale-105"
                      }`}
                    />

                    {/* Wishlist button */}
                    <button
                      type="button"
                      onClick={() =>
                        toggleWishlist(book.title)
                      }
                      aria-label="Remove from wishlist"
                      className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-2xl text-red-500 shadow-md transition hover:scale-110"
                    >
                      ♥
                    </button>

                    {/* Category */}
                    <div className="absolute bottom-4 left-4 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#071A33]">
                      {book.category}
                    </div>

                    {/* Out of stock overlay */}
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

                    {/* Price */}
                    <p className="mt-4 text-2xl font-bold text-[#B8892D]">
                      {book.price.toLocaleString()} DZD
                    </p>

                    {/* Availability */}
                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-wider text-gray-400">
                        Availability
                      </p>

                      <p
                        className={`mt-1 text-sm font-bold ${
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

                    {/* Buttons */}
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">

                      {/* View Book */}
                      <Link
                        href={`/book?title=${encodeURIComponent(
                          book.title
                        )}`}
                        className="rounded-full border border-[#071A33] px-4 py-3 text-center font-semibold text-[#071A33] transition hover:bg-[#071A33] hover:text-white"
                      >
                        View Book
                      </Link>

                      {/* Add to Cart */}
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => {
                          if (isOutOfStock) return;

                          addToCart({
                            id: book.id,
                            title: book.title,
                            author: book.author,
                            price: book.price,
                            image: book.image,
                          });
                        }}
                        className={`rounded-full px-4 py-3 font-semibold transition ${
                          isOutOfStock
                            ? "cursor-not-allowed bg-gray-200 text-gray-400"
                            : "bg-[#E8B04A] text-[#071A33] hover:bg-[#F3C866]"
                        }`}
                      >
                        {isOutOfStock
                          ? "Out of Stock"
                          : "Add to Cart"}
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() =>
                        toggleWishlist(book.title)
                      }
                      className="mt-4 w-full text-sm font-semibold text-gray-500 transition hover:text-red-600"
                    >
                      Remove from Wishlist
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}