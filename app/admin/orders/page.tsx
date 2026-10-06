"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  Check,
  Trash2,
  Search,
  X,
  ShoppingCart,
  User,
  Phone,
  MapPin,
  Calendar,
  Package,
  Mail,
} from "lucide-react";

type OrderItem = {
  title: string;
  quantity: number;
  price: number;
  image?: string;
};

type Order = {
  orderId: string;
  userEmail?: string;
  customerName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  region?: string;
  city?: string;
  address?: string;
  items?: OrderItem[];
  total?: number;
  totalAmount?: number;
  status?: string;
  createdAt?: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      setFilteredOrders(orders);
      return;
    }

    const filtered = orders.filter((order) => {
      const customerName =
        order.customerName ||
        `${order.firstName || ""} ${order.lastName || ""}`.trim();

      return (
        order.orderId?.toLowerCase().includes(value) ||
        order.userEmail?.toLowerCase().includes(value) ||
        customerName.toLowerCase().includes(value) ||
        order.phone?.toLowerCase().includes(value) ||
        order.status?.toLowerCase().includes(value)
      );
    });

    setFilteredOrders(filtered);
  }, [search, orders]);

  async function fetchOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/orders");

      if (!response.ok) {
        throw new Error("Failed to load orders");
      }

      const data = await response.json();

      const orderList = Array.isArray(data)
        ? data
        : Array.isArray(data.orders)
        ? data.orders
        : [];

      setOrders(orderList);
      setFilteredOrders(orderList);
    } catch (err) {
      console.error(err);
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(orderId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to confirm this order?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(orderId);
      setError("");

      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          action: "confirm",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to confirm order");
      }

      await fetchOrders();

      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to confirm order."
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(orderId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(orderId);
      setError("");

      const response = await fetch("/api/admin/orders", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete order");
      }

      setOrders((current) =>
        current.filter((order) => order.orderId !== orderId)
      );

      setSelectedOrder(null);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete order."
      );
    } finally {
      setActionLoading(null);
    }
  }

  function getCustomerName(order: Order) {
    if (order.customerName) {
      return order.customerName;
    }

    const name = `${order.firstName || ""} ${
      order.lastName || ""
    }`.trim();

    return name || "Unknown customer";
  }

  function getTotal(order: Order) {
    return Number(order.total ?? order.totalAmount ?? 0);
  }

  function getItemsCount(order: Order) {
    return (
      order.items?.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      ) || 0
    );
  }

  function getStatus(order: Order) {
    return order.status || "pending";
  }

  function formatStatus(status: string) {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  function getStatusClasses(status: string) {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-700";

      case "cancelled":
      case "canceled":
        return "bg-red-100 text-red-700";

      case "pending":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  }

  function formatDate(date?: string) {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function getAddress(order: Order) {
    const parts = [
      order.address,
      order.city,
      order.region,
      order.country,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "—";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F4EC] p-4 sm:p-6 lg:p-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-[#E8B04A]" />
            <p className="mt-3 text-sm text-gray-500">
              Loading orders...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4EC] p-3 sm:p-5 lg:p-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#071A33] sm:text-2xl">
              Orders
            </h1>

            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Manage customer orders
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">
            <ShoppingCart
              size={16}
              className="text-[#B8892D]"
            />

            <span className="text-sm font-semibold text-[#071A33]">
              {orders.length}
            </span>

            <span className="text-xs text-gray-500">
              orders
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-4 max-w-md">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              rounded-lg
              border
              border-gray-200
              bg-white
              py-2.5
              pl-9
              pr-4
              text-sm
              text-[#071A33]
              outline-none
              transition
              focus:border-[#E8B04A]
              focus:ring-1
              focus:ring-[#E8B04A]
            "
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Empty */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <ShoppingCart
            size={38}
            className="mx-auto text-gray-300"
          />

          <h2 className="mt-4 text-base font-semibold text-[#071A33]">
            No orders found
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {search
              ? "Try another search."
              : "There are no orders yet."}
          </p>
        </div>
      ) : (
        <>
          {/* ================================================= */}
          {/* MOBILE - CARDS */}
          {/* ================================================= */}

          <div className="space-y-3 md:hidden">
            {filteredOrders.map((order) => {
              const status = getStatus(order);
              const customerName = getCustomerName(order);
              const isActionLoading =
                actionLoading === order.orderId;

              return (
                <div
                  key={order.orderId}
                  className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  {/* Top */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#071A33]">
                        #{order.orderId}
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-500">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusClasses(
                        status
                      )}`}
                    >
                      {formatStatus(status)}
                    </span>
                  </div>

                  {/* Customer */}
                  <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-2">
                      <User
                        size={14}
                        className="shrink-0 text-gray-400"
                      />

                      <span className="truncate text-sm font-medium text-[#071A33]">
                        {customerName}
                      </span>
                    </div>

                    {order.userEmail && (
                      <div className="flex items-center gap-2">
                        <Mail
                          size={14}
                          className="shrink-0 text-gray-400"
                        />

                        <span className="truncate text-xs text-gray-500">
                          {order.userEmail}
                        </span>
                      </div>
                    )}

                    {order.phone && (
                      <div className="flex items-center gap-2">
                        <Phone
                          size={14}
                          className="shrink-0 text-gray-400"
                        />

                        <span className="text-xs text-gray-500">
                          {order.phone}
                        </span>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <MapPin
                        size={14}
                        className="mt-0.5 shrink-0 text-gray-400"
                      />

                      <span className="line-clamp-2 text-xs text-gray-500">
                        {getAddress(order)}
                      </span>
                    </div>
                  </div>

                  {/* Bottom */}
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                    <div>
                      <p className="text-[11px] text-gray-400">
                        Items
                      </p>

                      <p className="text-sm font-semibold text-[#071A33]">
                        {getItemsCount(order)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] text-gray-400">
                        Total
                      </p>

                      <p className="text-sm font-bold text-[#071A33]">
                        {getTotal(order).toLocaleString()} DA
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="
                        flex
                        flex-1
                        items-center
                        justify-center
                        gap-1.5
                        rounded-lg
                        border
                        border-gray-200
                        bg-white
                        px-3
                        py-2
                        text-xs
                        font-medium
                        text-[#071A33]
                        transition
                        hover:bg-gray-50
                      "
                    >
                      <Eye size={14} />
                      View
                    </button>

                    {status.toLowerCase() === "pending" && (
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() =>
                          handleConfirm(order.orderId)
                        }
                        className="
                          flex
                          flex-1
                          items-center
                          justify-center
                          gap-1.5
                          rounded-lg
                          bg-green-600
                          px-3
                          py-2
                          text-xs
                          font-medium
                          text-white
                          transition
                          hover:bg-green-700
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        <Check size={14} />
                        Confirm
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() =>
                        handleDelete(order.orderId)
                      }
                      className="
                        flex
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-red-200
                        px-3
                        py-2
                        text-red-500
                        transition
                        hover:bg-red-50
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                      title="Delete order"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================================================= */}
          {/* DESKTOP - COMPACT TABLE */}
          {/* ================================================= */}

          <div className="hidden overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className="bg-[#071A33] text-white">
                  <tr>
                    <th className="w-[13%] px-3 py-2.5 text-left text-[11px] font-semibold">
                      Order ID
                    </th>

                    <th className="w-[17%] px-3 py-2.5 text-left text-[11px] font-semibold">
                      Customer
                    </th>

                    <th className="w-[10%] px-3 py-2.5 text-left text-[11px] font-semibold">
                      Phone
                    </th>

                    <th className="w-[10%] px-3 py-2.5 text-left text-[11px] font-semibold">
                      Date
                    </th>

                    <th className="w-[8%] px-3 py-2.5 text-center text-[11px] font-semibold">
                      Items
                    </th>

                    <th className="w-[11%] px-3 py-2.5 text-right text-[11px] font-semibold">
                      Total
                    </th>

                    <th className="w-[10%] px-3 py-2.5 text-center text-[11px] font-semibold">
                      Status
                    </th>

                    <th className="w-[21%] px-3 py-2.5 text-center text-[11px] font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => {
                    const status = getStatus(order);
                    const customerName =
                      getCustomerName(order);

                    const isActionLoading =
                      actionLoading === order.orderId;

                    return (
                      <tr
                        key={order.orderId}
                        className="transition hover:bg-[#F8F4EC]/60"
                      >
                        {/* Order ID */}
                        <td className="px-3 py-2.5 align-middle">
                          <p
                            className="truncate text-xs font-semibold text-[#071A33]"
                            title={order.orderId}
                          >
                            #{order.orderId}
                          </p>
                        </td>

                        {/* Customer */}
                        <td className="px-3 py-2.5 align-middle">
                          <div className="min-w-0">
                            <p
                              className="truncate text-xs font-semibold text-[#071A33]"
                              title={customerName}
                            >
                              {customerName}
                            </p>

                            <p
                              className="mt-0.5 truncate text-[10px] text-gray-400"
                              title={order.userEmail}
                            >
                              {order.userEmail || "—"}
                            </p>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-3 py-2.5 align-middle">
                          <p
                            className="truncate text-[11px] text-gray-600"
                            title={order.phone}
                          >
                            {order.phone || "—"}
                          </p>
                        </td>

                        {/* Date */}
                        <td className="px-3 py-2.5 align-middle">
                          <p className="text-[11px] text-gray-600">
                            {formatDate(order.createdAt)}
                          </p>
                        </td>

                        {/* Items */}
                        <td className="px-3 py-2.5 text-center align-middle">
                          <span className="text-xs font-semibold text-[#071A33]">
                            {getItemsCount(order)}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="px-3 py-2.5 text-right align-middle">
                          <span className="whitespace-nowrap text-xs font-bold text-[#071A33]">
                            {getTotal(order).toLocaleString()} DA
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-2.5 text-center align-middle">
                          <span
                            className={`
                              inline-flex
                              rounded-full
                              px-2
                              py-1
                              text-[10px]
                              font-semibold
                              ${getStatusClasses(status)}
                            `}
                          >
                            {formatStatus(status)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-2.5 align-middle">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedOrder(order)
                              }
                              title="View order"
                              className="
                                inline-flex
                                h-7
                                items-center
                                gap-1
                                rounded-md
                                border
                                border-gray-200
                                bg-white
                                px-2
                                text-[10px]
                                font-medium
                                text-[#071A33]
                                transition
                                hover:bg-gray-50
                              "
                            >
                              <Eye size={12} />
                              View
                            </button>

                            {status.toLowerCase() ===
                              "pending" && (
                              <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={() =>
                                  handleConfirm(
                                    order.orderId
                                  )
                                }
                                title="Confirm order"
                                className="
                                  inline-flex
                                  h-7
                                  items-center
                                  gap-1
                                  rounded-md
                                  bg-green-600
                                  px-2
                                  text-[10px]
                                  font-medium
                                  text-white
                                  transition
                                  hover:bg-green-700
                                  disabled:cursor-not-allowed
                                  disabled:opacity-50
                                "
                              >
                                <Check size={12} />
                                Confirm
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() =>
                                handleDelete(order.orderId)
                              }
                              title="Delete order"
                              className="
                                inline-flex
                                h-7
                                w-7
                                items-center
                                justify-center
                                rounded-md
                                border
                                border-red-200
                                text-red-500
                                transition
                                hover:bg-red-50
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                              "
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ===================================================== */}
      {/* VIEW ORDER MODAL */}
      {/* ===================================================== */}

      {selectedOrder && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/50
            p-3
            sm:p-5
          "
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="
              max-h-[92vh]
              w-full
              max-w-2xl
              overflow-y-auto
              rounded-2xl
              bg-white
              shadow-2xl
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3.5 sm:px-5">
              <div>
                <h2 className="text-base font-bold text-[#071A33]">
                  Order Details
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  #{selectedOrder.orderId}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-4 sm:p-5">
              {/* Customer */}
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#B8892D]">
                  Customer
                </h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center gap-2">
                      <User
                        size={15}
                        className="text-gray-400"
                      />

                      <span className="text-[11px] text-gray-400">
                        Name
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-semibold text-[#071A33]">
                      {getCustomerName(selectedOrder)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center gap-2">
                      <Mail
                        size={15}
                        className="text-gray-400"
                      />

                      <span className="text-[11px] text-gray-400">
                        Email
                      </span>
                    </div>

                    <p className="mt-1 break-all text-sm font-semibold text-[#071A33]">
                      {selectedOrder.userEmail || "—"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center gap-2">
                      <Phone
                        size={15}
                        className="text-gray-400"
                      />

                      <span className="text-[11px] text-gray-400">
                        Phone
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-semibold text-[#071A33]">
                      {selectedOrder.phone || "—"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center gap-2">
                      <Calendar
                        size={15}
                        className="text-gray-400"
                      />

                      <span className="text-[11px] text-gray-400">
                        Date
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-semibold text-[#071A33]">
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                </div>
              </section>

              {/* Delivery */}
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#B8892D]">
                  Delivery Address
                </h3>

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="flex items-start gap-2">
                    <MapPin
                      size={16}
                      className="mt-0.5 shrink-0 text-gray-400"
                    />

                    <p className="text-sm leading-6 text-gray-700">
                      {getAddress(selectedOrder)}
                    </p>
                  </div>
                </div>
              </section>

              {/* Items */}
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#B8892D]">
                  Order Items
                </h3>

                <div className="overflow-hidden rounded-lg border border-gray-100">
                  {selectedOrder.items &&
                  selectedOrder.items.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {selectedOrder.items.map(
                        (item, index) => (
                          <div
                            key={`${item.title}-${index}`}
                            className="flex items-center justify-between gap-3 p-3"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#071A33]">
                                {item.title}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                Quantity: {item.quantity}
                              </p>
                            </div>

                            <p className="shrink-0 text-sm font-semibold text-[#071A33]">
                              {(
                                Number(item.price || 0) *
                                Number(item.quantity || 0)
                              ).toLocaleString()}{" "}
                              DA
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No items found.
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between rounded-lg bg-[#071A33] px-4 py-3 text-white">
                  <span className="text-sm font-medium">
                    Total
                  </span>

                  <span className="text-base font-bold">
                    {getTotal(
                      selectedOrder
                    ).toLocaleString()}{" "}
                    DA
                  </span>
                </div>
              </section>

              {/* Status */}
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#B8892D]">
                  Status
                </h3>

                <div>
                  <span
                    className={`
                      inline-flex
                      rounded-full
                      px-3
                      py-1.5
                      text-xs
                      font-semibold
                      ${getStatusClasses(
                        getStatus(selectedOrder)
                      )}
                    `}
                  >
                    {formatStatus(
                      getStatus(selectedOrder)
                    )}
                  </span>
                </div>
              </section>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="
                  rounded-lg
                  border
                  border-gray-200
                  bg-white
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-[#071A33]
                  transition
                  hover:bg-gray-50
                "
              >
                Close
              </button>

              {getStatus(selectedOrder).toLowerCase() ===
                "pending" && (
                <button
                  type="button"
                  disabled={
                    actionLoading ===
                    selectedOrder.orderId
                  }
                  onClick={() =>
                    handleConfirm(
                      selectedOrder.orderId
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-green-600
                    px-4
                    py-2
                    text-sm
                    font-medium
                    text-white
                    transition
                    hover:bg-green-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <Check size={15} />
                  Confirm Order
                </button>
              )}

              <button
                type="button"
                disabled={
                  actionLoading ===
                  selectedOrder.orderId
                }
                onClick={() =>
                  handleDelete(selectedOrder.orderId)
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border
                  border-red-200
                  bg-white
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-red-500
                  transition
                  hover:bg-red-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}