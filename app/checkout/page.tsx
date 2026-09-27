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
  const [address, setAddress] = useState("");

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
      <main className="min-h-screen bg-[#F8F4EC] px-6 py-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-5xl">🛒</div>

          <h1 className="mt-4 text-3xl font-bold text-[#071A33]">
            Your cart is empty
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Add some books before proceeding to checkout.
          </p>

          <Link
            href="/books"
            className="mt-5 inline-block rounded-full bg-[#E8B04A] px-7 py-2.5 text-sm font-semibold text-[#071A33] transition hover:bg-[#F3C866]"
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

    if (!address.trim()) {
      setOrderError("Please enter your delivery address.");
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
          address: address.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setOrderError(
          data.error || "Unable to create the order."
        );
        setIsSubmitting(false);
        return;
      }

      console.log("Order created:", data.order);

      clearCart();

      router.push(
        `/order-success?orderId=${data.order.orderId}`
      );
    } catch (error) {
      console.error("Create order error:", error);

      setOrderError("Unable to connect to the server.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F4EC] px-6 py-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#B8892D]">
            BookStore
          </p>

          <h1 className="mt-1 text-3xl font-bold text-[#071A33] md:text-4xl">
            Checkout
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Complete your order
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">

          {/* Customer Information */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-[#071A33]">
              Customer Information
            </h2>

            <div className="space-y-4">

              {/* Full Name */}
              <div>
                <p className="text-xs text-gray-500">
                  Full Name
                </p>

                <p className="mt-1 text-sm font-semibold text-[#071A33]">
                  {user?.name}
                </p>
              </div>

              {/* Email */}
              <div>
                <p className="text-xs text-gray-500">
                  Email
                </p>

                <p className="mt-1 text-sm font-semibold text-[#071A33]">
                  {user?.email}
                </p>
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="mb-1.5 block text-sm font-semibold text-[#071A33]"
                >
                  Delivery Address
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <textarea
                  id="address"
                  rows={3}
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  placeholder="Enter your delivery address"
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-[#071A33]">
              Order Summary
            </h2>

            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between border-b border-gray-100 pb-3"
                >
                  <div className="min-w-0 pr-4">
                    <p className="truncate text-sm font-semibold text-[#071A33]">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-semibold text-[#B8892D]">
                    {(item.price * item.quantity).toLocaleString(
                      "fr-FR"
                    )}{" "}
                    DZD
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-5 border-t border-gray-200 pt-5">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-[#071A33]">
                  Total
                </span>

                <span className="text-xl font-extrabold text-[#B8892D]">
                  {subtotal.toLocaleString("fr-FR")} DZD
                </span>
              </div>

              {/* Error */}
              {orderError && (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
                  {orderError}
                </p>
              )}

              {/* Place Order */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="mt-5 w-full rounded-full bg-[#071A33] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#E8B04A] hover:text-[#071A33] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Creating Order..."
                  : "Place Order"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}