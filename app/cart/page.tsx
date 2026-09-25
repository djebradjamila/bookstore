
"use client";

import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";

export default function Cart() {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const { isAuthenticated } = useAuth();

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-[#F8F4EC] px-6 py-10">
      <div className="mx-auto max-w-5xl">

        <h1 className="mb-8 text-4xl font-bold text-[#071A33]">
          🛒 My Cart
        </h1>

        {cart.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-md">
            <div className="text-5xl">🛒</div>

            <h2 className="mt-4 text-2xl font-bold text-[#071A33]">
              Your cart is empty
            </h2>

            <p className="mt-2 text-gray-500">
              Add some books to your cart before checking out.
            </p>

            <a
              href="/books"
              className="mt-6 inline-block rounded-full bg-[#E8B04A] px-8 py-3 font-semibold text-[#071A33] transition hover:bg-[#F3C866]"
            >
              Browse Books
            </a>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Cart Items */}
            {cart.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-md sm:flex-row sm:items-center sm:justify-between"
              >

                <div className="flex items-center gap-5">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-28 w-20 rounded-lg object-cover"
                  />

                  <div>
                    <h2 className="text-xl font-bold text-[#071A33]">
                      {item.title}
                    </h2>

                    <p className="mt-1 text-gray-500">
                      {item.author}
                    </p>

                    <p className="mt-2 font-semibold text-[#B8892D]">
                      {item.price.toLocaleString("fr-FR")} DZD
                    </p>
                  </div>
                </div>

                {/* Quantity + Remove */}
                <div className="flex items-center gap-4">

                  <button
                    type="button"
                    onClick={() => decreaseQuantity(item.title)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#071A33] text-white transition hover:bg-[#E8B04A] hover:text-[#071A33]"
                  >
                    −
                  </button>

                  <span className="min-w-6 text-center font-bold text-[#071A33]">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => increaseQuantity(item.title)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#071A33] text-white transition hover:bg-[#E8B04A] hover:text-[#071A33]"
                  >
                    +
                  </button>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.title)}
                    className="ml-2 text-sm font-semibold text-red-500 transition hover:text-red-700"
                  >
                    Remove
                  </button>

                </div>
              </div>
            ))}

            {/* Summary */}
            <div className="rounded-2xl bg-white p-6 text-right shadow-md">

              <p className="text-3xl font-extrabold text-[#071A33]">
                Subtotal:{" "}
                <span className="text-[#B8892D]">
                  {subtotal.toLocaleString("fr-FR")} DZD
                </span>
              </p>

              {/* Checkout */}
              {isAuthenticated ? (
                 <a
                   href="/checkout"
                   className="mt-5 inline-block rounded-full bg-[#071A33] px-8 py-3 font-semibold text-white transition hover:bg-[#E8B04A] hover:text-[#071A33]"
                   >
                    Checkout
                 </a>
                ) : (
                  <a
                    href="/signin?redirect=/checkout"
                    className="mt-5 inline-block rounded-full bg-[#071A33] px-8 py-3 font-semibold text-white transition hover:bg-[#E8B04A] hover:text-[#071A33]"
                    >
                    Checkout
                  </a>
                )}

            </div>
          </div>
        )}
      </div>
    </main>
  );
}

