"use client";

import Link from "next/link";
import { useWishlist } from "@/components/WishlistContext";
import { useCart } from "@/components/CartContext";

const books = [
  {
    title: "The Little Prince",
    author: "Antoine de Saint-Exupéry",
    price: 1200,
    image: "/books/petit-prince.jpg",
  },
  {
    title: "Python for Beginners",
    author: "Mark Lutz",
    price: 2500,
    image: "/books/python.jpg",
  },
  {
    title: "Mathematics for Everyone",
    author: "Jean Dupont",
    price: 1800,
    image: "/books/maths.jpg",
  },
];

export default function Wishlist() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const wishlistBooks = books.filter((book) =>
    wishlist.includes(book.title)
  );

  return (
    <main className="min-h-screen bg-[#F8F4EC] px-6 py-12">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#B8892D]">
            Saved for later
          </p>

          <h1 className="text-4xl font-bold text-[#071A33] md:text-5xl">
            My Wishlist ❤️
          </h1>

          <p className="mt-3 text-gray-600">
            {wishlistBooks.length} book
            {wishlistBooks.length !== 1 ? "s" : ""} saved in your wishlist.
          </p>
        </div>

        {/* Empty Wishlist */}
        {wishlistBooks.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F8F4EC] text-5xl">
              ♡
            </div>

            <h2 className="mt-6 text-2xl font-bold text-[#071A33]">
              Your wishlist is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-gray-500">
              Save your favorite books here and come back to them whenever
              you want.
            </p>

            <Link
              href="/books"
              className="mt-7 inline-block rounded-full bg-[#E8B04A] px-7 py-3 font-semibold text-[#071A33] transition hover:bg-[#F3C866]"
            >
              Discover Books
            </Link>
          </div>
        ) : (
          /* Wishlist Books */
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {wishlistBooks.map((book) => (
              <div
                key={book.title}
                className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(book.title)}
                    aria-label={`Remove ${book.title} from wishlist`}
                    className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl text-red-500 shadow-md transition hover:scale-110"
                  >
                    ♥
                  </button>
                </div>

                {/* Information */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-[#071A33]">
                    {book.title}
                  </h2>

                  <p className="mt-2 text-gray-600">
                    {book.author}
                  </p>

                  <p className="mt-4 text-xl font-bold text-[#071A33]">
                    {book.price.toLocaleString("fr-FR")} DZD
                  </p>

                  {/* Actions */}
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <Link
                      href={`/book?title=${encodeURIComponent(book.title)}`}
                      className="rounded-full border border-[#071A33] px-4 py-3 text-center font-semibold text-[#071A33] transition hover:bg-[#071A33] hover:text-white"
                    >
                      View Book
                    </Link>

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
                      className="rounded-full bg-[#E8B04A] px-4 py-3 font-semibold text-[#071A33] transition hover:bg-[#F3C866]"
                    >
                      Add to Cart
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(book.title)}
                    className="mt-3 w-full rounded-full px-4 py-2 text-sm font-medium text-gray-500 transition hover:text-red-500"
                  >
                    Remove from Wishlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}