"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  Users,
  Mail,
  Calendar,
  Eye,
  X,
  User,
  Phone,
  MapPin,
  ShoppingBag,
} from "lucide-react";

type UserData = {
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  username?: string;
  phone?: string;
  address?: string;
  country?: string;
  region?: string;
  city?: string;
  createdAt?: string;
  orderCount?: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] =
    useState<UserData | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter((user) => {
      const fullName = getUserName(user);

      return (
        user.email?.toLowerCase().includes(value) ||
        fullName.toLowerCase().includes(value) ||
        user.firstName?.toLowerCase().includes(value) ||
        user.lastName?.toLowerCase().includes(value) ||
        user.username?.toLowerCase().includes(value) ||
        user.phone?.toLowerCase().includes(value)
      );
    });

    setFilteredUsers(filtered);
  }, [search, users]);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/users");

      if (!response.ok) {
        throw new Error("Failed to load users");
      }

      const data = await response.json();

      const userList = Array.isArray(data)
        ? data
        : Array.isArray(data.users)
        ? data.users
        : [];

      setUsers(userList);
      setFilteredUsers(userList);
    } catch (err) {
      console.error(err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(email: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user? This will remove their access to the store."
    );

    if (!confirmed) return;

    try {
      setActionLoading(email);
      setError("");

      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete user"
        );
      }

      setUsers((current) =>
        current.filter((user) => user.email !== email)
      );

      setSelectedUser(null);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete user."
      );
    } finally {
      setActionLoading(null);
    }
  }

  function getUserName(user: UserData) {
    if (user.name) {
      return user.name;
    }

    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${
        user.lastName || ""
      }`.trim();
    }

    if (user.username) {
      return user.username;
    }

    return "Unknown user";
  }

  function getAddress(user: UserData) {
    const parts = [
      user.address,
      user.city,
      user.region,
      user.country,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : "—";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F4EC] p-4 sm:p-6 lg:p-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-[#E8B04A]" />

            <p className="mt-3 text-sm text-gray-500">
              Loading users...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4EC] p-3 sm:p-5 lg:p-6">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="mb-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#071A33] sm:text-2xl">
              Users
            </h1>

            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Manage registered customers
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">
            <Users
              size={16}
              className="text-[#B8892D]"
            />

            <span className="text-sm font-semibold text-[#071A33]">
              {users.length}
            </span>

            <span className="text-xs text-gray-500">
              users
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
            placeholder="Search users..."
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

      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ================================================= */}
      {/* EMPTY */}
      {/* ================================================= */}

      {filteredUsers.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <Users
            size={38}
            className="mx-auto text-gray-300"
          />

          <h2 className="mt-4 text-base font-semibold text-[#071A33]">
            No users found
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {search
              ? "Try another search."
              : "There are no registered users yet."}
          </p>
        </div>
      ) : (
        <>
          {/* ================================================= */}
          {/* MOBILE - CARDS */}
          {/* ================================================= */}

          <div className="space-y-3 md:hidden">
            {filteredUsers.map((user) => {
              const userName = getUserName(user);

              return (
                <div
                  key={user.email}
                  className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  {/* Top */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#071A33] text-white">
                        <User size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#071A33]">
                          {userName}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Information */}
                  <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
                    {user.phone && (
                      <div className="flex items-center gap-2">
                        <Phone
                          size={14}
                          className="shrink-0 text-gray-400"
                        />

                        <span className="text-xs text-gray-500">
                          {user.phone}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Calendar
                        size={14}
                        className="shrink-0 text-gray-400"
                      />

                      <span className="text-xs text-gray-500">
                        Joined {formatDate(user.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <ShoppingBag
                        size={14}
                        className="shrink-0 text-gray-400"
                      />

                      <span className="text-xs text-gray-500">
                        {user.orderCount ?? 0}{" "}
                        {(user.orderCount ?? 0) === 1
                          ? "order"
                          : "orders"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedUser(user)
                      }
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

                    <button
                      type="button"
                      disabled={
                        actionLoading === user.email
                      }
                      onClick={() =>
                        handleDelete(user.email)
                      }
                      className="
                        flex
                        items-center
                        justify-center
                        gap-1.5
                        rounded-lg
                        border
                        border-red-200
                        px-4
                        py-2
                        text-red-500
                        transition
                        hover:bg-red-50
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <Trash2 size={14} />
                      <span className="text-xs">
                        Delete
                      </span>
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
                    <th className="w-[20%] px-3 py-2.5 text-left text-[11px] font-semibold">
                      User
                    </th>

                    <th className="w-[24%] px-3 py-2.5 text-left text-[11px] font-semibold">
                      Email
                    </th>

                    <th className="w-[14%] px-3 py-2.5 text-left text-[11px] font-semibold">
                      Phone
                    </th>

                    <th className="w-[13%] px-3 py-2.5 text-left text-[11px] font-semibold">
                      Joined
                    </th>

                    <th className="w-[10%] px-3 py-2.5 text-center text-[11px] font-semibold">
                      Orders
                    </th>

                    <th className="w-[19%] px-3 py-2.5 text-center text-[11px] font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => {
                    const userName = getUserName(user);

                    const isActionLoading =
                      actionLoading === user.email;

                    return (
                      <tr
                        key={user.email}
                        className="transition hover:bg-[#F8F4EC]/60"
                      >
                        {/* User */}
                        <td className="px-3 py-2.5 align-middle">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#071A33] text-white">
                              <User size={13} />
                            </div>

                            <p
                              className="truncate text-xs font-semibold text-[#071A33]"
                              title={userName}
                            >
                              {userName}
                            </p>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-3 py-2.5 align-middle">
                          <p
                            className="truncate text-[11px] text-gray-600"
                            title={user.email}
                          >
                            {user.email}
                          </p>
                        </td>

                        {/* Phone */}
                        <td className="px-3 py-2.5 align-middle">
                          <p
                            className="truncate text-[11px] text-gray-600"
                            title={user.phone}
                          >
                            {user.phone || "—"}
                          </p>
                        </td>

                        {/* Joined */}
                        <td className="px-3 py-2.5 align-middle">
                          <p className="text-[11px] text-gray-600">
                            {formatDate(user.createdAt)}
                          </p>
                        </td>

                        {/* Orders */}
                        <td className="px-3 py-2.5 text-center align-middle">
                          <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold text-[#071A33]">
                            {user.orderCount ?? 0}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-2.5 align-middle">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedUser(user)
                              }
                              title="View user"
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

                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() =>
                                handleDelete(user.email)
                              }
                              title="Delete user"
                              className="
                                inline-flex
                                h-7
                                items-center
                                gap-1
                                rounded-md
                                border
                                border-red-200
                                px-2
                                text-[10px]
                                font-medium
                                text-red-500
                                transition
                                hover:bg-red-50
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                              "
                            >
                              <Trash2 size={12} />
                              Delete
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

      {/* ================================================= */}
      {/* VIEW USER MODAL */}
      {/* ================================================= */}

      {selectedUser && (
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
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="
              max-h-[92vh]
              w-full
              max-w-lg
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
                  User Details
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Customer information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-4 sm:p-5">
              {/* Profile */}
              <div className="flex items-center gap-3 rounded-xl bg-[#F8F4EC] p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#071A33] text-white">
                  <User size={21} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-[#071A33]">
                    {getUserName(selectedUser)}
                  </p>

                  <p className="truncate text-xs text-gray-500">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              {/* Information */}
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#B8892D]">
                  Information
                </h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Name */}
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
                      {getUserName(selectedUser)}
                    </p>
                  </div>

                  {/* Email */}
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
                      {selectedUser.email}
                    </p>
                  </div>

                  {/* Phone */}
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
                      {selectedUser.phone || "—"}
                    </p>
                  </div>

                  {/* Joined */}
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center gap-2">
                      <Calendar
                        size={15}
                        className="text-gray-400"
                      />

                      <span className="text-[11px] text-gray-400">
                        Joined
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-semibold text-[#071A33]">
                      {formatDate(
                        selectedUser.createdAt
                      )}
                    </p>
                  </div>
                </div>
              </section>

              {/* Address */}
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#B8892D]">
                  Address
                </h3>

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="flex items-start gap-2">
                    <MapPin
                      size={16}
                      className="mt-0.5 shrink-0 text-gray-400"
                    />

                    <p className="text-sm leading-6 text-gray-700">
                      {getAddress(selectedUser)}
                    </p>
                  </div>
                </div>
              </section>

              {/* Orders */}
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#B8892D]">
                  Orders
                </h3>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#071A33] text-white">
                      <ShoppingBag size={16} />
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Total orders
                      </p>

                      <p className="text-lg font-bold text-[#071A33]">
                        {selectedUser.orderCount ?? 0}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
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

              <button
                type="button"
                disabled={
                  actionLoading === selectedUser.email
                }
                onClick={() =>
                  handleDelete(selectedUser.email)
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
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}