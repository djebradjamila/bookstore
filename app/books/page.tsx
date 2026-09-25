"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useWishlist } from "@/components/WishlistContext";
import { useCart } from "@/components/CartContext";

type Book = {
  id: string;
  title: string;
  author: string;
  price: number;
  category: string;
  image: string;
};

function BooksContent() {
  const searchParams = useSearchParams();

  const categoryFromUrl = searchParams.get("category");
  const searchFromUrl = searchParams.get("search") || "";

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(searchFromUrl);
  const [category, setCategory] = useState("All Categories");
  const [sort, setSort] = useState("Sort by");

  const { wishlist, toggleWishlist, isWishlisted } = useWishlist();
  const { addToCart } = useCart();

  // Fetch books from DynamoDB through our API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch("/api/books");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch books");
        }

        const formattedBooks: Book[] = data.books.map((book: any) => ({
          id: book.id?.S || "",
          title: book.title?.S || "",
          author: book.author?.S || "",
          price: Number(book.price?.N || 0),
          category: book.category?.S || "",
          image: book.image?.S || "",
        }));

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

  // Search + Category
  const activeCategory = categoryFromUrl || category;

  const filteredBooks = books
    .filter((book) => {
      const matchesSearch = `${book.title} ${book.author}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === "All Categories" ||
        book.category === activeCategory;

      return matchesSearch && matchesCategory;
    })

    // Sort
    .sort((a, b) => {
      if (sort === "Price: Low to High") {
        return a.price - b.price;
      }

      if (sort === "Price: High to Low") {
        return b.price - a.price;
      }

      return 0;
    });

  return (
    <main className="min-h-screen bg-[#F8F4EC]">

      {/* Page Header */}
      <section className="bg-[#F8F4EC] px-6 py-16">
        <div className="text-center">
          <p className="font-semibold uppercase tracking-[0.25em] text-[#B8892D]">
            Our Collection
          </p>

          <h1 className="mt-3 text-5xl font-bold text-[#071A33]">
            All Books
          </h1>

          <p className="text-center">
            Explore our collection and discover your next favorite book.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-6">

        {/* Search and Filters */}
        <div className="mb-12 -mt-2 rounded-2xl bg-white p-4 shadow-md ring-1 ring-gray-100">
          <div className="flex flex-col gap-3 lg:flex-row">

            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search books or authors..."
                className="w-full rounded-xl border border-gray-200 bg-[#F8F4EC] py-3.5 pl-12 pr-4 text-[#071A33] outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
              />
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-gray-200 bg-[#F8F4EC] px-5 py-3.5 text-[#071A33] outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
            >
              <option>All Categories</option>
              <option>Novels</option>
              <option>Computer Science</option>
              <option>Mathematics</option>
              <option>Science</option>
              <option>History</option>
            </select>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-gray-200 bg-[#F8F4EC] px-5 py-3.5 text-[#071A33] outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
            >
              <option>Sort by</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
            </select>

          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-20 text-center">
            <div className="text-4xl">📚</div>
            <p className="mt-4 text-gray-500">
              Loading books...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-3xl bg-white py-20 text-center shadow-sm">
            <div className="text-5xl">⚠️</div>

            <h2 className="mt-5 text-2xl font-bold text-[#071A33]">
              Something went wrong
            </h2>

            <p className="mt-2 text-gray-500">
              {error}
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            {/* Results count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold text-[#071A33]">
                  {filteredBooks.length}
                </span>{" "}
                {filteredBooks.length === 1 ? "book" : "books"}
              </p>

              <div className="flex items-center gap-4">
                {/* Wishlist count */}
                <p className="text-sm font-medium text-gray-500">
                  Wishlist{" "}
                  <span className="font-bold text-[#B8892D]">
                    {wishlist.length}
                  </span>
                </p>

                {(search ||
                  category !== "All Categories" ||
                  sort !== "Sort by") && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setCategory("All Categories");
                      setSort("Sort by");
                    }}
                    className="text-sm font-semibold text-[#B8892D] transition hover:text-[#071A33]"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Books */}
            {filteredBooks.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

                {filteredBooks.map((book) => (
                  <article
                    key={book.id}
                    className="group relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                  >

                    {/* Image */}
                    <div className="relative h-[360px] overflow-hidden bg-[#EEE8DC]">

                      <img
                        src={book.image}
                        alt={book.title}
                        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
                      />

                      {/* Image overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#071A33]/20 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />

                      {/* Wishlist */}
                      <button
                        type="button"
                        aria-label={
                          isWishlisted(book.title)
                            ? `Remove ${book.title} from wishlist`
                            : `Add ${book.title} to wishlist`
                        }
                        onClick={() => toggleWishlist(book.title)}
                        className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/70 text-xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
                          isWishlisted(book.title)
                            ? "bg-[#071A33] text-[#E8B04A]"
                            : "bg-white/90 text-[#071A33] hover:bg-[#071A33] hover:text-white"
                        }`}
                      >
                        {isWishlisted(book.title) ? "♥" : "♡"}
                      </button>

                      {/* Category badge */}
                      <div className="absolute bottom-4 left-4">
                        <span className="rounded-full border border-[#E8B04A]/40 bg-[#071A33]/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#E8B04A] backdrop-blur-sm">
                          {book.category}
                        </span>
                      </div>

                    </div>

                    {/* Information */}
                    <div className="p-6">

                      {/* Category */}
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B8892D]">
                        {book.category}
                      </p>

                      {/* Title */}
                      <h2 className="mt-2 line-clamp-1 text-2xl font-bold text-[#071A33] transition-colors duration-300 group-hover:text-[#B8892D]">
                        {book.title}
                      </h2>

                      {/* Author */}
                      <p className="mt-2 text-sm text-gray-500">
                        by{" "}
                        <span className="font-medium text-gray-700">
                          {book.author}
                        </span>
                      </p>

                      {/* Rating */}
                      <div className="mt-4 flex items-center gap-2">
                        <div className="flex gap-0.5 text-sm text-[#E8B04A]">
                          ★ ★ ★ ★ ★
                        </div>

                        <span className="text-xs font-medium text-gray-400">
                          4.8
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="my-5 h-px bg-gray-100" />

                      {/* Price + Buttons */}
                      <div className="flex flex-col gap-4">

                        {/* Price */}
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-400">
                            Price
                          </p>

                          <p className="mt-1 text-2xl font-extrabold text-[#071A33]">
                            {book.price.toLocaleString("fr-FR")}
                            <span className="ml-1 text-sm font-semibold text-[#B8892D]">
                              DZD
                            </span>
                          </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col gap-2 sm:flex-row">

                          {/* Add to Cart */}
                          <button
                            type="button"
                            onClick={() =>
                              addToCart({
                                title: book.title,
                                author: book.author,
                                price: book.price,
                                image: book.image,
                              })
                            }
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#E8B04A] px-4 py-3 text-sm font-semibold text-[#071A33] shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F3C866] hover:shadow-lg"
                          >
                            🛒 Add to Cart
                          </button>

                          {/* View Book */}
                          <a
                            href={`/book?title=${encodeURIComponent(book.title)}`}
                            className="group/button inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#071A33] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#E8B04A] hover:text-[#071A33] hover:shadow-lg"
                          >
                            View Book

                            <span className="transition-transform duration-300 group-hover/button:translate-x-1">
                              →
                            </span>
                          </a>

                        </div>
                      </div>
                    </div>
                  </article>
                ))}

              </div>
            ) : (

              /* No Results */
              <div className="rounded-3xl bg-white py-20 text-center shadow-sm">
                <div className="text-5xl">📚</div>

                <h2 className="mt-5 text-2xl font-bold text-[#071A33]">
                  No books found
                </h2>

                <p className="mt-2 text-gray-500">
                  Try changing your search or filters.
                </p>

                <button
                  onClick={() => {
                    setSearch("");
                    setCategory("All Categories");
                    setSort("Sort by");
                  }}
                  className="mt-6 rounded-full bg-[#071A33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#E8B04A] hover:text-[#071A33]"
                >
                  Reset Filters
                </button>
              </div>

            )}
          </>
        )}

      </section>
    </main>
  );
}
export default function Books() {
  return (
    <Suspense fallback={<div>Loading books...</div>}>
      <BooksContent />
    </Suspense>
  );
}