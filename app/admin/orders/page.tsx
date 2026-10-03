
"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  Package,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  X,
  ShoppingBag,
  CheckCircle,
  Trash2,
} from "lucide-react";

type OrderItem = {
  id?: string;
  title?: string;
  name?: string;
  author?: string;
  price?: number;
  quantity?: number;
  image?: string;
};

type Order = {
  orderId: string;
  userEmail: string;

  firstName: string;
  lastName: string;
  phone: string;

  country: string;
  region: string;
  city: string;
  address: string;

  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  confirmedAt?: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [confirming, setConfirming] =
    useState(false);

  const [actionMessage, setActionMessage] =
    useState("");

  const [actionError, setActionError] =
    useState("");

  // --------------------------------------------------
  // Load all orders
  // --------------------------------------------------

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/orders"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to load orders."
        );
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error(
        "Load orders error:",
        error
      );

      setError("Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // --------------------------------------------------
  // Confirm order
  // --------------------------------------------------

  const confirmOrder = async () => {
    if (!selectedOrder) return;

    const confirmed = window.confirm(
      `Are you sure you want to confirm order ${selectedOrder.orderId}? The stock will be decreased.`
    );

    if (!confirmed) return;

    try {
      setConfirming(true);
      setActionMessage("");
      setActionError("");

      const response = await fetch(
        "/api/admin/orders",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: selectedOrder.orderId,
            action: "confirm",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to confirm order."
        );
      }

      setActionMessage(
        "Order confirmed successfully. Stock has been updated."
      );

      await loadOrders();

      setSelectedOrder((current) =>
        current
          ? {
              ...current,
              status: "confirmed",
            }
          : null
      );
    } catch (error) {
      console.error(
        "Confirm order error:",
        error
      );

      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to confirm order."
      );
    } finally {
      setConfirming(false);
    }
  };

  // --------------------------------------------------
  // Delete order
  // --------------------------------------------------

  const deleteOrder = async () => {
    if (!selectedOrder) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete order ${selectedOrder.orderId}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setConfirming(true);
      setActionMessage("");
      setActionError("");

      const response = await fetch(
        "/api/admin/orders",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: selectedOrder.orderId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to delete order."
        );
      }

      setSelectedOrder(null);

      await loadOrders();
    } catch (error) {
      console.error(
        "Delete order error:",
        error
      );

      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to delete order."
      );
    } finally {
      setConfirming(false);
    }
  };

  // --------------------------------------------------
  // Format date
  // --------------------------------------------------

  const formatDate = (date: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  // --------------------------------------------------
  // Format price
  // --------------------------------------------------

  const formatPrice = (price: number) => {
    return `${Number(
      price || 0
    ).toLocaleString()} DZD`;
  };

  // --------------------------------------------------
  // Status style
  // --------------------------------------------------

  const getStatusStyle = (
    status: string
  ) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "cancelled":
      case "canceled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F4EC] px-6 py-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#071A33]">
              <Package
                size={22}
                className="text-[#E8B04A]"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#071A33]">
                Orders
              </h1>

              <p className="text-sm text-gray-500">
                Manage and view all customer orders
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#071A33]" />

            <p className="text-gray-500">
              Loading orders...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="mb-4 text-red-600">
              {error}
            </p>

            <button
              onClick={loadOrders}
              className="rounded-lg bg-[#071A33] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#0d294b]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          orders.length === 0 && (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
              <Package
                size={45}
                className="mx-auto mb-4 text-gray-300"
              />

              <h2 className="text-lg font-semibold text-[#071A33]">
                No orders found
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                There are currently no customer orders.
              </p>
            </div>
          )}

        {/* Orders table */}
        {!loading &&
          !error &&
          orders.length > 0 && (
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Order
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Customer
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Contact
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Address
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Total
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Date
                      </th>

                      <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.orderId}
                        className="border-b border-gray-100 last:border-0 hover:bg-[#F8F4EC]/40"
                      >
                        {/* Order ID */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#071A33]">
                              <ShoppingBag
                                size={17}
                                className="text-[#E8B04A]"
                              />
                            </div>

                            <div>
                              <p className="font-semibold text-[#071A33]">
                                {order.orderId}
                              </p>

                              <p className="text-xs text-gray-400">
                                {order.items?.length ||
                                  0}{" "}
                                item
                                {order.items
                                  ?.length !== 1
                                  ? "s"
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-5 py-4">
                          <p className="font-medium text-[#071A33]">
                            {order.firstName}{" "}
                            {order.lastName}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {order.userEmail}
                          </p>
                        </td>

                        {/* Contact */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={14} />

                            <span>
                              {order.phone || "-"}
                            </span>
                          </div>
                        </td>

                        {/* Address */}
                        <td className="max-w-[220px] px-5 py-4">
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <MapPin
                              size={15}
                              className="mt-0.5 shrink-0"
                            />

                            <span className="line-clamp-2">
                              {order.address || "-"}
                              {order.city
                                ? `, ${order.city}`
                                : ""}
                            </span>
                          </div>
                        </td>

                        {/* Total */}
                        <td className="px-5 py-4">
                          <p className="font-semibold text-[#071A33]">
                            {formatPrice(
                              order.total
                            )}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} />

                            {formatDate(
                              order.createdAt
                            )}
                          </div>
                        </td>

                        {/* View */}
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => {
                              setActionMessage("");
                              setActionError("");
                              setSelectedOrder(
                                order
                              );
                            }}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#071A33] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0d294b]"
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 px-5 py-4">
                <p className="text-sm text-gray-500">
                  Total orders:{" "}
                  <span className="font-semibold text-[#071A33]">
                    {orders.length}
                  </span>
                </p>
              </div>
            </div>
          )}
      </div>

      {/* VIEW ORDER MODAL */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          onClick={() =>
            setSelectedOrder(null)
          }
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Order details
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#071A33]">
                  {selectedOrder.orderId}
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 p-6">

              {/* Action messages */}
              {actionMessage && (
                <div className="flex items-start gap-3 rounded-xl bg-green-50 p-4 text-sm text-green-700">
                  <CheckCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <p>{actionMessage}</p>
                </div>
              )}

              {actionError && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                  {actionError}
                </div>
              )}

              {/* Customer information */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <User
                    size={18}
                    className="text-[#B8892D]"
                  />

                  <h3 className="font-semibold text-[#071A33]">
                    Customer Information
                  </h3>
                </div>

                <div className="grid gap-4 rounded-xl bg-[#F8F4EC] p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">
                      Full name
                    </p>

                    <p className="mt-1 font-medium text-[#071A33]">
                      {selectedOrder.firstName}{" "}
                      {selectedOrder.lastName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Email
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <Mail
                        size={14}
                        className="text-gray-500"
                      />

                      <p className="break-all text-sm font-medium text-[#071A33]">
                        {selectedOrder.userEmail}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Phone
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <Phone
                        size={14}
                        className="text-gray-500"
                      />

                      <p className="text-sm font-medium text-[#071A33]">
                        {selectedOrder.phone || "-"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Order date
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <Calendar
                        size={14}
                        className="text-gray-500"
                      />

                      <p className="text-sm font-medium text-[#071A33]">
                        {formatDate(
                          selectedOrder.createdAt
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Delivery information */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <MapPin
                    size={18}
                    className="text-[#B8892D]"
                  />

                  <h3 className="font-semibold text-[#071A33]">
                    Delivery Information
                  </h3>
                </div>

                <div className="rounded-xl bg-[#F8F4EC] p-4">
                  <p className="font-medium text-[#071A33]">
                    {selectedOrder.address || "-"}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {selectedOrder.city || "-"}
                    {selectedOrder.region
                      ? `, ${selectedOrder.region}`
                      : ""}
                  </p>

                  <p className="text-sm text-gray-600">
                    {selectedOrder.country || "-"}
                  </p>
                </div>
              </section>

              {/* Order items */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <ShoppingBag
                    size={18}
                    className="text-[#B8892D]"
                  />

                  <h3 className="font-semibold text-[#071A33]">
                    Ordered Books
                  </h3>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-100">
                  {selectedOrder.items &&
                  selectedOrder.items.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {selectedOrder.items.map(
                        (item, index) => {
                          const itemName =
                            item.title ||
                            item.name ||
                            "Book";

                          const quantity =
                            Number(
                              item.quantity
                            ) || 1;

                          const price =
                            Number(
                              item.price
                            ) || 0;

                          return (
                            <div
                              key={`${item.id || itemName}-${index}`}
                              className="flex items-center justify-between gap-4 p-4"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-[#071A33]">
                                  {itemName}
                                </p>

                                {item.author && (
                                  <p className="mt-1 text-xs text-gray-500">
                                    {item.author}
                                  </p>
                                )}

                                <p className="mt-1 text-xs text-gray-500">
                                  Quantity:{" "}
                                  {quantity}
                                </p>
                              </div>

                              <p className="shrink-0 font-semibold text-[#071A33]">
                                {formatPrice(
                                  price *
                                    quantity
                                )}
                              </p>
                            </div>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <div className="p-5 text-center text-sm text-gray-500">
                      No items found.
                    </div>
                  )}
                </div>
              </section>

              {/* Order summary */}
              <section className="rounded-xl bg-[#071A33] p-5 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">
                    Status
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="font-medium">
                    Total
                  </span>

                  <span className="text-xl font-bold text-[#E8B04A]">
                    {formatPrice(
                      selectedOrder.total
                    )}
                  </span>
                </div>
              </section>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                {selectedOrder.status ===
                  "pending" && (
                  <button
                    onClick={confirmOrder}
                    disabled={confirming}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle size={17} />

                    {confirming
                      ? "Confirming..."
                      : "Confirm Order"}
                  </button>
                )}

                <button
                  onClick={deleteOrder}
                  disabled={confirming}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 size={17} />

                  {confirming
                    ? "Processing..."
                    : "Delete Order"}
                </button>
              </div>

              <button
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="rounded-lg bg-[#071A33] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#0d294b]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

