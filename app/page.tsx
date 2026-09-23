

const popularBooks = [
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

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8F4EC]">
      

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2">
          
          {/* Text */}
          <div>
            <p className="mb-4 font-semibold uppercase tracking-[0.2em] text-[#B8892D]">
              Welcome to BookStore
            </p>

            <h1 className="text-5xl font-bold leading-tight text-[#071A33] md:text-6xl">
              Discover Your
              <span className="block text-[#B8892D]">
                Next Great Book
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Explore our collection of books, discover new stories,
              and find your next favorite read.
            </p>

            {/* Search */}
            <div className="mt-8 flex max-w-xl overflow-hidden rounded-full bg-white shadow-md">
              <input
                type="text"
                placeholder="Search for books, authors..."
                className="flex-1 px-6 py-4 outline-none"
              />

              <button className="bg-[#E8B04A] px-7 font-semibold text-[#071A33] hover:bg-[#F3C866]">
                Search
              </button>
            </div>

            {/* Button */}
            <a
              href="/books"
              className="mt-6 inline-block rounded-full bg-[#071A33] px-8 py-4 font-semibold text-white shadow-md transition hover:bg-[#102B4D]"
            >
              Explore Books →
            </a>
          </div>

          {/* Hero Visual */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-6 rounded-full bg-[#E8B04A]/20 blur-2xl"></div>

              <div className="relative flex h-80 w-80 items-center justify-center rounded-full bg-[#071A33] shadow-2xl">
                <div className="text-center text-white">
                  <div className="text-8xl">📚</div>
                  <p className="mt-4 text-2xl font-semibold">
                    Read.
                  </p>
                  <p className="text-[#E8B04A]">
                    Discover. Enjoy.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Popular Books */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="font-semibold uppercase tracking-widest text-[#B8892D]">
              Our Collection
            </p>

            <h2 className="mt-2 text-4xl font-bold text-[#071A33]">
              Popular Books
            </h2>
          </div>

          <a
            href="/books"
            className="font-semibold text-[#B8892D] hover:text-[#071A33]"
          >
            View All →
          </a>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {popularBooks.map((book) => (
            <div
              key={book.title}
              className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-2 hover:shadow-xl"
            >
              <img
                src={book.image}
                alt={book.title}
                className="h-72 w-full object-cover"
              />

              <div className="p-6">
                <h3 className="text-xl font-bold text-[#071A33]">
                  {book.title}
                </h3>

                <p className="mt-2 text-gray-500">
                  {book.author}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xl font-bold text-[#B8892D]">
                    {book.price} DZD
                  </span>

                  <a
                    href="/book"
                    className="rounded-full bg-[#071A33] px-5 py-2 text-sm font-semibold text-white hover:bg-[#102B4D]"
                  >
                    View Book
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}