"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Search, ShoppingCart } from "lucide-react";
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

export default function BooksPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/books");

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
            price: Number(
              book.price?.N || book.price || 0
            ),
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
        setError("Unable to load books.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(books.map((book) => book.category).filter(Boolean))
    );

    return ["All", ...uniqueCategories];
  }, [books]);

  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (search.trim()) {
      const searchValue = search.toLowerCase();

      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(searchValue) ||
          book.author.toLowerCase().includes(searchValue) ||
          book.category.toLowerCase().includes(searchValue)
      );
    }

    if (category !== "All") {
      result = result.filter(
        (book) => book.category === category
      );
    }

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sort === "title") {
      result.sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    }

    return result;
  }, [books, search, category, sort]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F4EC] px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[400px] items-center justify-center">
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
            Bookstore
          </p>

          <h1 className="text-4xl font-bold text-[#071A33] md:text-5xl">
            Our Books
          </h1>

          <p className="mt-3 text-gray-600">
            Discover books from different categories and
            find your next favorite read.
          </p>
        </div>

        {/* Search and filters */}
        <div className="mb-10 rounded-3xl bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_220px_220px]">

            {/* Search */}
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search books, authors..."
                className="w-full rounded-full border border-gray-200 bg-[#F8F4EC] py-3 pl-12 pr-5 outline-none transition focus:border-[#B8892D]"
              />
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="rounded-full border border-gray-200 bg-[#F8F4EC] px-5 py-3 text-[#071A33] outline-none focus:border-[#B8892D]"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full border border-gray-200 bg-[#F8F4EC] px-5 py-3 text-[#071A33] outline-none focus:border-[#B8892D]"
            >
              <option value="default">
                Sort by
              </option>
              <option value="price-low">
                Price: Low to High
              </option>
              <option value="price-high">
                Price: High to Low
              </option>
              <option value="title">
                Title: A-Z
              </option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {filteredBooks.length} book
            {filteredBooks.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-[#071A33]">
              No books found
            </h2>

            <p className="mt-3 text-gray-500">
              Try another search or category.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => {
              const isOutOfStock = book.stock <= 0;

              const isWishlisted = wishlist.includes(
                book.title
              );

              return (
                <div
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
                      className={`h-72 w-full object-cover transition duration-500 ${
                        isOutOfStock
                          ? "grayscale opacity-60"
                          : "group-hover:scale-105"
                      }`}
                    />

                    {/* Wishlist */}
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
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <Link
                        href={`/book?title=${encodeURIComponent(
                          book.title
                        )}`}
                        className="rounded-full border border-[#071A33] px-4 py-3 text-center font-semibold text-[#071A33] transition hover:bg-[#071A33] hover:text-white"
                      >
                        View Book
                      </Link>

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
                        className={`flex items-center justify-center gap-2 rounded-full px-4 py-3 font-semibold transition ${
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
                    </div>
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