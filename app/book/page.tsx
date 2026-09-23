export default function BookDetails() {
  const book = {
    title: "The Little Prince",
    author: "Antoine de Saint-Exupéry",
    price: 1200,
    category: "Novels",
    description:
      "An unforgettable story full of poetry, friendship, and discovery.",
    image: "/books/petit-prince.jpg",
  };

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow">
        <div className="grid gap-8 md:grid-cols-2">
          <img
            src={book.image}
            alt={book.title}
            className="h-96 w-full rounded-lg object-cover"
          />

          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              {book.title}
            </h1>

            <p className="mt-4 text-lg text-gray-600">
              Author: {book.author}
            </p>

            <p className="mt-3 text-blue-600">
              Category: {book.category}
            </p>

            <p className="mt-6 text-gray-700">
              {book.description}
            </p>

            <p className="mt-6 text-2xl font-bold text-gray-800">
              {book.price} DZD
            </p>

            <button className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
              Add to Cart 🛒
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}