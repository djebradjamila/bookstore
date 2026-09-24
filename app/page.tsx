
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

     {/* About BookStore */}

     <section className="border-t border-[#071A33]/5 bg-white">
       <div className="mx-auto max-w-7xl px-6 py-20">
         <div className="mx-auto max-w-3xl text-center">
            <p className="font-semibold uppercase tracking-[0.2em] text-[#B8892D]">
             About BookStore
            </p>
            <h2 className="mt-3 text-4xl font-bold text-[#071A33] md:text-5xl">
              Your Place for Great Books
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              BookStore is a modern online bookstore designed to make
              discovering and choosing books simple, enjoyable, and convenient.
            </p>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Explore different categories, search for your favorite books,
              save books to your wishlist, and add your favorite titles to
              your shopping cart.
            </p>
          </div>

         {/* Contact Us  */}
         <div className="mt-14 text-center">
           <a
             href="/contUs"
             className="inline-block rounded-full bg-[#071A33] px-8 py-4 font-semibold text-white shadow-md transition hover:-translate-y-1 hover:bg-[#102B4D]"
              >
               Contact Us →
            </a>
          </div>
        </div>
      </section>
   </main>

  );
}