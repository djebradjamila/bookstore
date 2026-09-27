"use client";

import Link from "next/link";

const categories = [
  {
    name: "Novels",
    description: "Discover captivating stories and unforgettable characters.",
    icon: "📖",
  },
  {
    name: "Computer Science",
    description: "Learn programming, software development, and technology.",
    icon: "💻",
  },
  {
    name: "Mathematics",
    description: "Explore numbers, formulas, logic, and problem solving.",
    icon: "📐",
  },
  {
    name: "Science",
    description: "Discover fascinating ideas about the world and nature.",
    icon: "🔬",
  },
  {
    name: "History",
    description: "Explore important events, people, and civilizations.",
    icon: "🏛️",
  },
];

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-[#F8F4EC] px-6 py-10 text-[#071A33]">
      <div className="mx-auto max-w-7xl">
        {/* Hero Section */}
        <section className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#B8892D]">
            Explore our collection
          </p>

          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            Find Your Next Great Read
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600">
            Discover books across our carefully selected categories.
          </p>

          <Link
            href="/books"
            className="mt-5 inline-block rounded-full bg-[#071A33] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#E8B04A] hover:text-[#071A33]"
          >
            Browse All Books →
          </Link>
        </section>

        {/* Categories */}
        <section>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/books?category=${encodeURIComponent(
                  category.name
                )}`}
                className="group rounded-2xl bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#F8F4EC] text-3xl transition group-hover:bg-[#E8B04A]">
                  {category.icon}
                </div>

                <h2 className="text-xl font-bold text-[#071A33] transition group-hover:text-[#B8892D]">
                  {category.name}
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {category.description}
                </p>

                <div className="mt-5 font-semibold text-[#B8892D]">
                  Explore Category →
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}