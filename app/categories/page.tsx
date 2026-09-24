
import Link from "next/link";

const categories = [
  {
    number: "01",
    name: "Novels",
    icon: "📖",
    description:
      "Lose yourself in captivating stories, unforgettable characters, and inspiring adventures.",
    books: "Explore stories",
  },
  {
    number: "02",
    name: "Computer Science",
    icon: "💻",
    description:
      "Discover programming, software development, artificial intelligence, and modern technology.",
    books: "Explore technology",
  },
  {
    number: "03",
    name: "Mathematics",
    icon: "∑",
    description:
      "Build your mathematical knowledge with books covering concepts, problems, and techniques.",
    books: "Explore mathematics",
  },
  {
    number: "04",
    name: "Science",
    icon: "🔬",
    description:
      "Discover fascinating scientific ideas, discoveries, experiments, and the world around us.",
    books: "Explore science",
  },
  {
    number: "05",
    name: "History",
    icon: "🏛️",
    description:
      "Travel through time and discover civilizations, important events, and remarkable people.",
    books: "Explore history",
  },
];

export default function Categories() {
  return (
    <main className="min-h-screen bg-[#F8F4EC]">

      {/* Hero */}
     
    <section className="relative overflow-hidden bg-[#F8F4EC] px-6 py-20">
     <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#E8B04A]/10 blur-3xl" />
     <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#E8B04A]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
         <div className="mx-auto max-w-3xl text-center">

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-[#B8892D]">
            Explore our collection
         </p>

         <h1 className="font-serif text-4xl font-bold italic leading-tight text-[#071A33] md:text-6xl">
           Find Your Next
           <span className="block text-[#B8892D]">
             Great Read
           </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl font-serif text-lg italic leading-8 text-gray-600">
           Explore our carefully selected book categories and discover
           something new to read, learn, and enjoy.
          </p>

          <Link
            href="/books"
           className="group relative overflow-hidden rounded-3xl bg-white p-7 shadow-md ring-1 ring-gray-100 transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
>
           Browse All Books
           <span>→</span>
         </Link>

       </div>
     </div>
    </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-16">

        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#B8892D]">
              Book categories
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[#071A33] md:text-4xl">
              Explore by Interest
            </h2>
          </div>

          <p className="max-w-md text-gray-500 md:text-right">
            Whether you want to learn something new or simply enjoy a good
            story, there is a category for you.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/books?category=${encodeURIComponent(category.name)}`}
              className="group relative overflow-hidden rounded-3xl bg-white p-7 shadow-md ring-1 ring-gray-100 transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              {/* Number */}
              <span className="absolute right-6 top-5 text-sm font-bold text-gray-200 transition group-hover:text-[#E8B04A]/40">
                {category.number}
              </span>

              {/* Icon */}
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8DCC8] text-3xl shadow-sm transition duration-300 group-hover:scale-110 group-hover:bg-[#E8B04A]">
                {category.icon}
              </div>

              {/* Content */}
              <div className="mt-7">
                <h3 className="text-2xl font-bold text-[#071A33]">
                  {category.name}
                </h3>

                <p className="mt-3 min-h-[84px] leading-7 text-gray-600">
                  {category.description}
                </p>
              </div>

              {/* Bottom */}
              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
                <span className="text-sm font-semibold text-[#B8892D]">
                  {category.books}
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F8F4EC] text-[#071A33] transition duration-300 group-hover:bg-[#071A33] group-hover:text-white">
                  →
                </span>
              </div>
             
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-6 mb-16 overflow-hidden rounded-3xl bg-[#071A33]">
        <div className="mx-auto max-w-4xl px-6 py-14 text-center">
          <div className="mb-4 text-4xl">📚</div>

          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Not sure what to read?
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-300">
            Explore our complete collection and discover books that match
            your interests.
          </p>

          {/*<Link
            href="/books"
            className="mt-7 inline-flex rounded-xl bg-[#E8B04A] px-7 py-3.5 font-semibold text-[#071A33] transition hover:bg-[#F3C866]"
          >
            Discover All Books
          </Link>*/}
          <div className="mt-14 text-center">
           <a
             href="/contUs"
              className="mt-7 inline-flex rounded-xl bg-[#E8B04A] px-7 py-3.5 font-semibold text-[#071A33] transition hover:bg-[#F3C866]"
              >
             Contact Us →
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}