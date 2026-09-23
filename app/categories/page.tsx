const categories = [
  {
    name: "Novels",
    icon: "📖",
    description: "Discover exciting novels and captivating stories.",
  },
  {
    name: "Computer Science",
    icon: "💻",
    description: "Books about programming, software, and technology.",
  },
  {
    name: "Mathematics",
    icon: "🧮",
    description: "Learn and improve your mathematics skills.",
  },
  {
    name: "Science",
    icon: "🔬",
    description: "Explore science and its fascinating discoveries.",
  },
  {
    name: "History",
    icon: "📜",
    description: "Discover important periods and events in history.",
  },
];

export default function Categories() {
  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <h1 className="mb-8 text-center text-4xl font-bold text-gray-800">
        📚 Our Categories
      </h1>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
        {categories.map((category) => (
          <div
            key={category.name}
            className="rounded-lg bg-white p-6 text-center shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-5xl">{category.icon}</div>

            <h2 className="mt-4 text-xl font-bold text-gray-800">
              {category.name}
            </h2>

            <p className="mt-3 text-sm text-gray-600">
              {category.description}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}