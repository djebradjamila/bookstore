
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";

export default function Checkout() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    if (!user && cart.length > 0) {
      router.push("/signin?redirect=/checkout");
    }
  }, [user, cart.length, router]);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#F8F4EC] px-6 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-6xl">🛒</div>

          <h1 className="mt-6 text-3xl font-bold text-[#071A33]">
            Your cart is empty
          </h1>

          <p className="mt-3 text-gray-600">
            Add some books before proceeding to checkout.
          </p>

          <Link
            href="/books"
            className="mt-6 inline-block rounded-full bg-[#E8B04A] px-8 py-3 font-semibold text-[#071A33] transition hover:bg-[#F3C866]"
          >
            Browse Books
          </Link>
        </div>
      </main>
    );
  }
    const handlePlaceOrder = async () => {
    if (!user) {
      router.push("/signin?redirect=/checkout");
      return;
    }

    setIsSubmitting(true);
    setOrderError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: user.email,
          items: cart,
          total: subtotal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setOrderError(data.error || "Unable to create the order.");
        setIsSubmitting(false);
        return;
      }

      console.log("Order created:", data.order);
       clearCart();
      router.push(`/order-success?orderId=${data.order.orderId}`);
    } catch (error) {
      console.error("Create order error:", error);
      setOrderError("Unable to connect to the server.");
      setIsSubmitting(false);
    }
  };
  return (
    <main className="min-h-screen bg-[#F8F4EC] px-6 py-12">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#071A33]">
            Checkout
          </h1>

          <p className="mt-2 text-gray-600">
            Complete your order
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">

          {/* Customer Information */}
          <div className="rounded-2xl bg-white p-8 shadow-md">
            <h2 className="mb-6 text-2xl font-bold text-[#071A33]">
              Customer Information
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">
                  Full Name
                </p>
                <p className="font-semibold text-[#071A33]">
                  {user?.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Email
                </p>
                <p className="font-semibold text-[#071A33]">
                  {user?.email}
                </p>
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-semibold text-[#071A33]"
                >
                  Delivery Address
                </label>

                <textarea
                  id="address"
                  rows={4}
                  placeholder="Enter your delivery address"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="rounded-2xl bg-white p-8 shadow-md">
            <h2 className="mb-6 text-2xl font-bold text-[#071A33]">
              Order Summary
            </h2>

            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between border-b border-gray-100 pb-4"
                >
                  <div>
                    <p className="font-semibold text-[#071A33]">
                      {item.title}
                    </p>

                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold text-[#B8892D]">
                    {(item.price * item.quantity).toLocaleString("fr-FR")} DZD
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-[#071A33]">
                  Total
                </span>

                <span className="text-2xl font-extrabold text-[#B8892D]">
                  {subtotal.toLocaleString("fr-FR")} DZD
                </span>
              </div>
              {orderError && (
                <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {orderError}
                </p>
              )}
              <button
                type="button"
                onClick={handlePlaceOrder}
                className="mt-6 w-full rounded-full bg-[#071A33] px-6 py-3 font-semibold text-white transition hover:bg-[#E8B04A] hover:text-[#071A33]"
              >
                {isSubmitting ? "Creating Order..." : "Place Order"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

