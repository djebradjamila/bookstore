
"use client";

import { useWishlist } from "@/components/WishlistContext";

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

  const wishlistBooks = books.filter((book) =>
    wishlist.includes(book.title)
  );

  return (
    <main className="min-h-screen bg-[#F8F4EC] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-4xl font-bold text-[#071A33]">
          ❤️ My Wishlist
        </h1>

        <p className="mb-10 text-gray-600">
          {wishlistBooks.length} book
          {wishlistBooks.length !== 1 ? "s" : ""} in your wishlist
        </p>

        {wishlistBooks.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-md">
            <div className="mb-4 text-5xl">♡</div>

            <h2 className="text-2xl font-bold text-[#071A33]">
              Your wishlist is empty
            </h2>

            <p className="mt-2 text-gray-500">
              Add your favorite books from the Books page.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {wishlistBooks.map((book) => (
              <div
                key={book.title}
                className="overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-gray-100"
              >
                <img
                  src={book.image}
                  alt={book.title}
                  className="h-72 w-full object-cover"
                />

                <div className="p-6">
                  <h2 className="text-xl font-bold text-[#071A33]">
                    {book.title}
                  </h2>

                  <p className="mt-2 text-gray-600">
                    {book.author}
                  </p>

                  <p className="mt-4 text-xl font-bold text-[#071A33]">
                    {book.price} DZD
                  </p>

                  <button
                    onClick={() => toggleWishlist(book.title)}
                    className="mt-5 w-full rounded-xl bg-[#071A33] px-4 py-3 font-semibold text-white transition hover:bg-[#0d2b50]"
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

