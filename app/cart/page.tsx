const cartItems = [
  {
    title: "The Little Prince",
    author: "Antoine de Saint-Exupéry",
    price: 1200,
    quantity: 1,
    image: "/books/petit-prince.jpg",
  },
  {
    title: "Python for Beginners",
    author: "Mark Lutz",
    price: 2500,
    quantity: 2,
    image: "/books/python.jpg",
  },
];

export default function Cart() {
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <h1 className="mb-8 text-4xl font-bold text-gray-800">
        🛒 My Cart
      </h1>

      <div className="mx-auto max-w-4xl space-y-6">
        {cartItems.map((item) => (
          <div
            key={item.title}
            className="flex gap-6 rounded-lg bg-white p-6 shadow"
          >
            <img
              src={item.image}
              alt={item.title}
              className="h-32 w-24 rounded-lg object-cover"
            />

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">
                {item.title}
              </h2>

              <p className="mt-2 text-gray-600">
                Author: {item.author}
              </p>

              <p className="mt-2">
                Quantity: {item.quantity}
              </p>

              <p className="mt-2 text-xl font-bold">
                {item.price * item.quantity} DZD
              </p>

              <button className="mt-3 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600">
                Remove
              </button>
            </div>
          </div>
        ))}

        <div className="rounded-lg bg-white p-6 text-right shadow">
          <p className="text-2xl font-bold">
            Subtotal: {subtotal} DZD
          </p>

          <button className="mt-4 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
            Checkout
          </button>
        </div>
      </div>
    </main>
  );
}