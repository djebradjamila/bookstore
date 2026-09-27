
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";

type OrderItem = {
  title: string;
  price: number;
  quantity: number;
};

type Order = {
  orderId: string;
  userEmail: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
};

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(
          `/api/orders?userEmail=${encodeURIComponent(user.email)}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Unable to load orders.");
          return;
        }

        setOrders(data.orders || []);
      } catch (error) {
        console.error("Load orders error:", error);
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, isAuthenticated]);

  // Confirm or cancel an order
  const updateOrder = async (
    orderId: string,
    action: "confirm" | "cancel"
  ) => {
    if (!user) return;

    try {
      setUpdatingOrderId(orderId);
      setError("");

      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          userEmail: user.email,
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to update the order.");
        return;
      }

      // If the order is cancelled, remove it from the page.
      if (action === "cancel") {
        setOrders((currentOrders) =>
          currentOrders.filter(
            (order) => order.orderId !== orderId
          )
        );
      } else {
        // If the order is confirmed, keep it and update its status.
        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order.orderId === orderId
              ? {
                  ...order,
                  status: "confirmed",
                }
              : order
          )
        );
      }
    } catch (error) {
      console.error("Update order error:", error);
      setError("Unable to connect to the server.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#F8F4EC] px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold text-[#071A33]">
            My Orders
          </h1>

          <p className="mt-4 text-gray-600">
            Please sign in to view your orders.
          </p>

          <Link
            href="/signin?redirect=/orders"
            className="mt-6 inline-block rounded-full bg-[#071A33] px-8 py-3 font-semibold text-white transition hover:bg-[#E8B04A] hover:text-[#071A33]"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F4EC] px-6 py-16">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-gray-600">
            Loading your orders...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F4EC] px-6 py-12">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-10">
          <p className="font-semibold uppercase tracking-[0.2em] text-[#B8892D]">
            Account
          </p>

          <h1 className="mt-2 text-4xl font-bold text-[#071A33]">
            My Orders
          </h1>

          <p className="mt-2 text-gray-600">
            View and manage your orders.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-5 text-red-600">
            {error}
          </div>
        )}

        {/* No orders */}
        {!error && orders.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-md">
            <div className="text-6xl">📦</div>

            <h2 className="mt-5 text-2xl font-bold text-[#071A33]">
              No orders yet
            </h2>

            <p className="mt-2 text-gray-600">
              Your orders will appear here after you make a purchase.
            </p>

            <Link
              href="/books"
              className="mt-6 inline-block rounded-full bg-[#E8B04A] px-8 py-3 font-semibold text-[#071A33] transition hover:bg-[#F3C866]"
            >
              Browse Books
            </Link>
          </div>
        )}

        {/* Orders */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="rounded-2xl bg-white p-6 shadow-md"
            >

              {/* Order Header */}
              <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 md:flex-row md:items-center md:justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    Order ID
                  </p>

                  <h2 className="font-bold text-[#071A33]">
                    {order.orderId}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString("fr-FR")}
                  </p>
                </div>

                {/* Status */}
                <span
                  className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
                    order.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : order.status === "confirmed"
                      ? "bg-blue-100 text-blue-700"
                      : order.status === "shipped"
                      ? "bg-purple-100 text-purple-700"
                      : order.status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() +
                    order.status.slice(1)}
                </span>
              </div>

              {/* Books */}
              <div className="py-5">
                <h3 className="mb-4 font-semibold text-[#071A33]">
                  Books
                </h3>

                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={`${item.title}-${index}`}
                      className="flex items-center justify-between rounded-xl bg-[#F8F4EC] px-4 py-3"
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
                        {(
                          item.price * item.quantity
                        ).toLocaleString("fr-FR")}{" "}
                        DZD
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div className="border-t border-gray-100 py-5">
                <p className="text-sm text-gray-500">
                  Delivery Address
                </p>

                <p className="mt-1 font-medium text-[#071A33]">
                  {order.address}
                </p>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-5">
                <span className="text-lg font-semibold text-[#071A33]">
                  Total
                </span>

                <span className="text-2xl font-extrabold text-[#B8892D]">
                  {order.total.toLocaleString("fr-FR")} DZD
                </span>
              </div>

              {/* Actions */}
              {order.status === "pending" && (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                  {/* Confirm Order */}
                  <button
                    type="button"
                    onClick={() =>
                      updateOrder(order.orderId, "confirm")
                    }
                    disabled={
                      updatingOrderId === order.orderId
                    }
                    className="flex-1 rounded-full bg-[#071A33] px-6 py-3 font-semibold text-white transition hover:bg-[#E8B04A] hover:text-[#071A33] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updatingOrderId === order.orderId
                      ? "Updating..."
                      : "Confirm Order"}
                  </button>

                  {/* Cancel Order */}
                  <button
                    type="button"
                    onClick={() =>
                      updateOrder(order.orderId, "cancel")
                    }
                    disabled={
                      updatingOrderId === order.orderId
                    }
                    className="flex-1 rounded-full border border-red-200 px-6 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updatingOrderId === order.orderId
                      ? "Updating..."
                      : "Cancel Order"}
                  </button>

                </div>
              )}

            </div>
          ))}
        </div>

      </div>
    </main>
  );
}

