"use client";

import { useState } from "react";

export default function Home() {
  const [search, setSearch] = useState("");

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();

    if (!search.trim()) {
      return;
    }

    window.location.href = `/books?search=${encodeURIComponent(
      search.trim()
    )}`;
  };

  return (
    <main className="min-h-screen bg-[#F8F4EC]">

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 py-10 md:grid-cols-2 md:py-12">

          {/* Text */}
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#B8892D]">
              Welcome to BookStore
            </p>

            <h1 className="text-4xl font-bold leading-tight text-[#071A33] md:text-5xl">
              Discover Your
              <span className="block text-[#B8892D]">
                Next Great Book
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-gray-600">
              Explore our collection, discover new stories,
              and find your next favorite read.
            </p>

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="mt-6 flex max-w-xl overflow-hidden rounded-full bg-white shadow-md"
            >
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search for books, authors..."
                className="min-w-0 flex-1 px-5 py-3 outline-none"
              />

              <button
                type="submit"
                className="bg-[#E8B04A] px-6 text-sm font-semibold text-[#071A33] transition hover:bg-[#F3C866]"
              >
                Search
              </button>
            </form>

            {/* Button */}
            <a
              href="/books"
              className="mt-5 inline-block rounded-full bg-[#071A33] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#E8B04A] hover:text-[#071A33]"
            >
              Explore Books →
            </a>
          </div>

          {/* Hero Visual */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-[#E8B04A]/20 blur-xl"></div>

              <div className="relative flex h-64 w-64 items-center justify-center rounded-full bg-[#071A33] shadow-xl">
                <div className="text-center text-white">
                  <div className="text-7xl">📚</div>

                  <p className="mt-3 text-xl font-semibold">
                    Read.
                  </p>

                  <p className="text-sm text-[#E8B04A]">
                    Discover. Enjoy.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* About BookStore */}
      <section className="border-t border-[#071A33]/5 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">

          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#B8892D]">
              About BookStore
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[#071A33] md:text-4xl">
              Your Place for Great Books
            </h2>

            <p className="mt-4 text-base leading-7 text-gray-600">
              BookStore makes discovering and choosing books
              simple, enjoyable, and convenient.
            </p>

            <p className="mt-2 text-base leading-7 text-gray-600">
              Browse categories, search for books, save favorites,
              and add your favorite titles to your cart.
            </p>
          </div>

          {/* Contact Us */}
          <div className="mt-7 text-center">
            <a
              href="/contUs"
              className="inline-block rounded-full bg-[#071A33] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#E8B04A] hover:text-[#071A33]"
            >
              Contact Us →
            </a>
          </div>

        </div>
      </section>

    </main>
  );
}