
"use client";

import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/CartContext";

const books = [
  {
    title: "The Little Prince",
    author: "Antoine de Saint-Exupéry",
    price: 1200,
    category: "Novels",
    description:
      "An unforgettable story full of poetry, friendship, and discovery.",
    image: "/books/petit-prince.jpg",
  },
  {
    title: "Python for Beginners",
    author: "Mark Lutz",
    price: 2500,
    category: "Computer Science",
    description:
      "A practical introduction to Python programming for beginners.",
    image: "/books/python.jpg",
  },
  {
    title: "Mathematics for Everyone",
    author: "Jean Dupont",
    price: 1800,
    category: "Mathematics",
    description:
      "An accessible book designed to make mathematics easier and more enjoyable.",
    image: "/books/maths.jpg",
  },
];

export default function BookDetails() {
  const searchParams = useSearchParams();
  const title = searchParams.get("title");

  const { addToCart } = useCart();

  const book =
    books.find((item) => item.title === title) || books[0];

  return (
    <main className="min-h-screen bg-[#F8F4EC] p-10">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-md">
        <div className="grid gap-8 md:grid-cols-2">

          {/* Book Image */}
          <img
            src={book.image}
            alt={book.title}
            className="h-96 w-full rounded-xl object-cover"
          />

          {/* Book Information */}
          <div>
            <h1 className="text-4xl font-bold text-[#071A33]">
              {book.title}
            </h1>

            <p className="mt-4 text-lg text-gray-600">
              Author: {book.author}
            </p>

            <p className="mt-3 font-medium text-[#B8892D]">
              Category: {book.category}
            </p>

            <p className="mt-6 text-gray-700">
              {book.description}
            </p>

            <p className="mt-6 text-2xl font-bold text-[#071A33]">
              {book.price.toLocaleString("fr-FR")} DZD
            </p>

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
              className="mt-6 rounded-full bg-[#E8B04A] px-6 py-3 font-semibold text-[#071A33] shadow-md transition hover:bg-[#F3C866] hover:shadow-lg"
            >
              Add to Cart 🛒
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

