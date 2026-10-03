
"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  type ElementType,
} from "react";
import * as LucideIcons from "lucide-react";

type Category = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

// =========================================================
// DEFAULT CATEGORY DETAILS
// Used only when icon or description is empty in DynamoDB
// =========================================================

function getDefaultCategoryDetails(name: string) {
  const category = name.toLowerCase();

  if (
    category.includes("novel") ||
    category.includes("fiction")
  ) {
    return {
      icon: "BookOpen",
      description:
        "Immerse yourself in captivating stories, memorable characters, and unforgettable adventures.",
    };
  }

  if (
    category.includes("computer") ||
    category.includes("programming") ||
    category.includes("technology") ||
    category.includes("software")
  ) {
    return {
      icon: "Laptop",
      description:
        "Discover programming, software development, computer science, and modern technology.",
    };
  }

  if (category.includes("math")) {
    return {
      icon: "Calculator",
      description:
        "Explore numbers, formulas, logic, problem solving, and mathematical ideas.",
    };
  }

  if (
    category.includes("science") ||
    category.includes("biology") ||
    category.includes("physics") ||
    category.includes("chemistry")
  ) {
    return {
      icon: "FlaskConical",
      description:
        "Explore scientific discoveries, fascinating ideas, experiments, and the world around us.",
    };
  }

  if (
    category.includes("history") ||
    category.includes("civilization") ||
    category.includes("ancient")
  ) {
    return {
      icon: "Landmark",
      description:
        "Explore important events, remarkable people, cultures, and civilizations from the past.",
    };
  }

  if (
    category.includes("psychology") ||
    category.includes("psych")
  ) {
    return {
      icon: "Brain",
      description:
        "Discover the human mind, behavior, emotions, and the fascinating world of psychology.",
    };
  }

  if (
    category.includes("art") ||
    category.includes("design") ||
    category.includes("painting")
  ) {
    return {
      icon: "Palette",
      description:
        "Explore creativity, artistic expression, design, and inspiring works of art.",
    };
  }

  if (
    category.includes("business") ||
    category.includes("econom") ||
    category.includes("finance")
  ) {
    return {
      icon: "BriefcaseBusiness",
      description:
        "Discover business, economics, finance, management, and professional knowledge.",
    };
  }

  if (
    category.includes("health") ||
    category.includes("medical") ||
    category.includes("medicine")
  ) {
    return {
      icon: "HeartPulse",
      description:
        "Explore health, medicine, wellness, and important knowledge about the human body.",
    };
  }

  if (
    category.includes("language") ||
    category.includes("linguistic") ||
    category.includes("english") ||
    category.includes("french")
  ) {
    return {
      icon: "Languages",
      description:
        "Improve your language skills and discover books about communication and languages.",
    };
  }

  if (
    category.includes("philosophy") ||
    category.includes("philosoph")
  ) {
    return {
      icon: "Lightbulb",
      description:
        "Explore ideas, questions, theories, and different ways of understanding life and the world.",
    };
  }

  if (
    category.includes("children") ||
    category.includes("kids") ||
    category.includes("child")
  ) {
    return {
      icon: "Baby",
      description:
        "Discover fun, educational, and engaging books specially selected for young readers.",
    };
  }

  if (
    category.includes("poetry") ||
    category.includes("poem")
  ) {
    return {
      icon: "PenLine",
      description:
        "Discover beautiful poems, creative writing, emotions, and inspiring literary works.",
    };
  }

  if (
    category.includes("travel") ||
    category.includes("tourism")
  ) {
    return {
      icon: "Plane",
      description:
        "Explore new places, cultures, destinations, and inspiring journeys around the world.",
    };
  }

  if (
    category.includes("self") ||
    category.includes("development") ||
    category.includes("motivation")
  ) {
    return {
      icon: "Sprout",
      description:
        "Discover ideas, advice, and knowledge to support personal growth and development.",
    };
  }

  return {
    icon: "BookOpen",
    description:
      `Explore our collection of books about ${name.toLowerCase()} and discover something new.`,
  };
}

// =========================================================
// CATEGORY ICON
//
// Supports BOTH:
// 1. Emoji stored by the Admin page
//    Example: 📚 💻 🧮 🔬
// 2. Old Lucide icon names
//    Example: BookOpen, Laptop, Calculator
// =========================================================

function CategoryIcon({
  iconName,
}: {
  iconName: string;
}) {
  const trimmedIcon = iconName.trim();

  if (!trimmedIcon) {
    return (
      <LucideIcons.BookOpen
        size={30}
        strokeWidth={2}
      />
    );
  }

  // -------------------------------------------------------
  // Check if the value is a Lucide icon name
  // -------------------------------------------------------

  const Icon = LucideIcons[
    trimmedIcon as keyof typeof LucideIcons
  ] as ElementType | undefined;

  if (Icon) {
    return (
      <Icon
        size={30}
        strokeWidth={2}
      />
    );
  }

  // -------------------------------------------------------
  // Otherwise treat it as an emoji
  // -------------------------------------------------------

  return (
    <span
      className="text-3xl leading-none"
      role="img"
      aria-label="Category icon"
    >
      {trimmedIcon}
    </span>
  );
}

// =========================================================
// CATEGORIES PAGE
// =========================================================

export default function CategoriesPage() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =======================================================
  // FETCH CATEGORIES
  // =======================================================

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/categories",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch categories"
          );
        }

        const data =
          await response.json();

        if (!data.success) {
          throw new Error(
            "Failed to load categories"
          );
        }

        setCategories(
          Array.isArray(data.categories)
            ? data.categories
            : []
        );
      } catch (error) {
        console.error(
          "Error fetching categories:",
          error
        );

        setError(
          "Unable to load categories."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // =======================================================
  // PAGE
  // =======================================================

  return (
    <main className="min-h-screen bg-[#F8F4EC] px-6 py-10 text-[#071A33]">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HERO SECTION
        ================================================= */}

        <section className="mb-10 text-center">

          <p className="text-sm font-semibold uppercase tracking-widest text-[#B8892D]">
            Explore by category
          </p>

          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            Find Books You Love
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600">
            Browse our collection and discover
            books across different subjects
            and interests.
          </p>

          <Link
            href="/books"
            className="mt-5 inline-block rounded-full bg-[#071A33] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#E8B04A] hover:text-[#071A33]"
          >
            Browse All Books →
          </Link>

        </section>

        {/* =================================================
            CATEGORIES SECTION
        ================================================= */}

        <section>

          {/* Loading */}

          {loading && (
            <div className="py-10 text-center text-gray-600">
              Loading categories...
            </div>
          )}

          {/* Error */}

          {error && (
            <div className="py-10 text-center text-red-600">
              {error}
            </div>
          )}

          {/* Empty */}

          {!loading &&
            !error &&
            categories.length === 0 && (
              <div className="py-10 text-center text-gray-600">
                No categories available.
              </div>
            )}

          {/* Categories */}

          {!loading &&
            !error &&
            categories.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                {categories.map(
                  (category) => {

                    // ------------------------------------------------
                    // Default information
                    // ------------------------------------------------

                    const defaultDetails =
                      getDefaultCategoryDetails(
                        category.name
                      );

                    // ------------------------------------------------
                    // Use DynamoDB icon first
                    // If empty -> use default Lucide icon
                    // ------------------------------------------------

                    const iconName =
                      category.icon?.trim() ||
                      defaultDetails.icon;

                    // ------------------------------------------------
                    // Use DynamoDB description first
                    // If empty -> use default description
                    // ------------------------------------------------

                    const description =
                      category.description?.trim() ||
                      defaultDetails.description;

                    return (
                      <Link
                        key={category.id}
                        href={`/books?category=${encodeURIComponent(
                          category.name
                        )}`}
                        className="group rounded-2xl bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                      >

                        {/* =================================================
                            CATEGORY ICON
                        ================================================= */}

                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#F8F4EC] text-[#071A33] transition group-hover:bg-[#E8B04A]">

                          <CategoryIcon
                            iconName={iconName}
                          />

                        </div>

                        {/* =================================================
                            CATEGORY NAME
                        ================================================= */}

                        <h2 className="text-xl font-bold text-[#071A33] transition group-hover:text-[#B8892D]">
                          {category.name}
                        </h2>

                        {/* =================================================
                            DESCRIPTION
                        ================================================= */}

                        <p className="mt-3 text-sm leading-6 text-gray-600">
                          {description}
                        </p>

                        {/* =================================================
                            EXPLORE LINK
                        ================================================= */}

                        <div className="mt-5 font-semibold text-[#B8892D]">
                          Explore Category →
                        </div>

                      </Link>
                    );
                  }
                )}

              </div>
            )}

        </section>
      </div>
    </main>
  );
}
