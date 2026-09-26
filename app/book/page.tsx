"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/components/CartContext";

type Book = {
  id: string;
  title: string;
  author: string;
  price: number;
  category: string;
  image: string;
  description: string;
};

function BookDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const title = searchParams.get("title");

  const { addToCart } = useCart();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBook = async () => {
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
          (item: any) => ({
            id: item.id?.S || item.id || "",
            title: item.title?.S || item.title || "",
            author: item.author?.S || item.author || "",
            price: Number(
              item.price?.N || item.price || 0
            ),
            category:
              item.category?.S || item.category || "",
            image: item.image?.S || item.image || "",
            description:
              item.description?.S ||
              item.description ||
              "An accessible book designed to make learning easier and more enjoyable.",
          })
        );

        const selectedBook = formattedBooks.find(
          (item) => item.title === title
        );

        if (!selectedBook) {
          setError("Book not found.");
          return;
        }

        setBook(selectedBook);
      } catch (err) {
        console.error(err);
        setError("Unable to load the book.");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [title]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F4EC] p-10">
        <div className="mx-auto max-w-4xl py-20 text-center">
          <div className="text-5xl">📚</div>

          <p className="mt-4 text-gray-500">
            Loading book...
          </p>
        </div>
      </main>
    );
  }

  if (error || !book) {
    return (
      <main className="min-h-screen bg-[#F8F4EC] p-10">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-12 text-center shadow-md">
          <div className="text-5xl">📚</div>

          <h1 className="mt-5 text-2xl font-bold text-[#071A33]">
            Book not found
          </h1>

          <p className="mt-2 text-gray-500">
            {error || "This book does not exist."}
          </p>

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-6 rounded-full bg-[#071A33] px-6 py-3 font-semibold text-white transition hover:bg-[#E8B04A] hover:text-[#071A33]"
          >
            ← Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F4EC] p-6 sm:p-10">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-md sm:p-8">
        <div className="grid gap-8 md:grid-cols-2">

          {/* Book Image */}
          <div className="overflow-hidden rounded-xl bg-[#EEE8DC]">
            <img
              src={book.image}
              alt={book.title}
              className="h-96 w-full object-cover transition duration-500 hover:scale-105"
            />
          </div>

          {/* Book Information */}
          <div className="flex flex-col">
            <p className="font-semibold uppercase tracking-[0.2em] text-[#B8892D]">
              {book.category}
            </p>

            <h1 className="mt-3 text-3xl font-bold text-[#071A33] sm:text-4xl">
              {book.title}
            </h1>

            <p className="mt-4 text-lg text-gray-600">
              By{" "}
              <span className="font-medium text-[#071A33]">
                {book.author}
              </span>
            </p>

            <div className="mt-5 flex gap-1 text-[#E8B04A]">
              ★ ★ ★ ★ ★
            </div>

            <p className="mt-6 leading-7 text-gray-700">
              {book.description}
            </p>

            <div className="my-6 h-px bg-gray-100" />

            <p className="text-sm uppercase tracking-wider text-gray-400">
              Price
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[#071A33]">
              {book.price.toLocaleString("fr-FR")}
              <span className="ml-2 text-base font-semibold text-[#B8892D]">
                DZD
              </span>
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
                className="flex-1 rounded-full bg-[#E8B04A] px-6 py-3 font-semibold text-[#071A33] shadow-md transition hover:bg-[#F3C866] hover:shadow-lg"
              >
                🛒 Add to Cart
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 rounded-full border border-[#071A33] px-6 py-3 font-semibold text-[#071A33] transition hover:bg-[#071A33] hover:text-white"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function BookDetails() {
  return (
    <Suspense fallback={<div>Loading book...</div>}>
      <BookDetailsContent />
    </Suspense>
  );
}