"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/CartContext";
import Link from "next/link";

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
  const title = searchParams.get("title");

  const { addToCart } = useCart();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch("/api/books");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch books");
        }

        const formattedBooks: Book[] = data.books.map((item: any) => ({
          id: item.id?.S || "",
          title: item.title?.S || "",
          author: item.author?.S || "",
          price: Number(item.price?.N || 0),
          category: item.category?.S || "",
          image: item.image?.S || "",
          description:
            item.description?.S ||
            "An accessible book designed to make learning easier and more enjoyable.",
        }));

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
          <p className="mt-4 text-gray-500">Loading book...</p>
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
        </div>
      </main>
    );
  }

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
           <div className="mt-6 flex flex-wrap gap-3">
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
               className="rounded-full bg-[#E8B04A] px-6 py-3 font-semibold text-[#071A33] shadow-md transition hover:bg-[#F3C866] hover:shadow-lg"
               >
                Add to Cart 🛒
              </button>

             <Link href="/wishlist"
               className="rounded-full border border-[#071A33] px-6 py-3 font-semibold text-[#071A33] transition hover:bg-[#071A33] hover:text-white"
               >
               ← Back to Wishlist
              </Link>
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