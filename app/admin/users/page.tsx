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
  phone?: string;
  address?: string;
  createdAt?: string;
  orderCount?: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingEmail, setDeletingEmail] =
    useState<string | null>(null);
  const [selectedUser, setSelectedUser] =
    useState<UserData | null>(null);

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/users");
      const data = await response.json();

      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Delete user
  const handleDelete = async (email: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) return;

    try {
      setDeletingEmail(email);

      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setUsers((prev) =>
          prev.filter((user) => user.email !== email)
        );

        if (selectedUser?.email === email) {
          setSelectedUser(null);
        }
      } else {
        alert(data.message || "Failed to delete user.");
      }
    } catch (error) {
      console.error("Delete user error:", error);
      alert("Failed to delete user.");
    } finally {
      setDeletingEmail(null);
    }
  };

  // Search users
  const filteredUsers = users.filter((user) => {
    const value = search.toLowerCase();

    return (
      user.email.toLowerCase().includes(value) ||
      (user.name || "").toLowerCase().includes(value) ||
      (user.firstName || "").toLowerCase().includes(value) ||
      (user.lastName || "").toLowerCase().includes(value)
    );
  });

  // Format date
  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Display name
  const getDisplayName = (user: UserData) => {
    const fullName = `${user.firstName || ""} ${
      user.lastName || ""
    }`.trim();

    if (fullName) return fullName;

    if (user.name) return user.name;

    return "User";
  };

  return (
    <main className="min-h-screen bg-[#F8F4EC] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#071A33] sm:text-3xl">
            Users
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage registered users
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8B04A]/15">
              <Users
                className="text-[#B8892D]"
                size={24}
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total Users
              </p>

              <p className="text-2xl font-bold text-[#071A33]">
                {users.length}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#E8B04A]"
            />
          </div>
        </div>

        {/* Users */}
        <div className="rounded-2xl bg-white shadow-sm">

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left">

                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    User
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    Email
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-500">
                    Joined
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-500">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-sm text-gray-500"
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-sm text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.email}
                      className="border-b border-gray-100 last:border-0"
                    >
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#071A33] text-white">
                            <User size={18} />
                          </div>

                          <div>
                            <p className="font-medium text-[#071A33]">
                              {getDisplayName(user)}
                            </p>

                            <p className="text-xs text-gray-400">
                              Customer
                            </p>
                          </div>

                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={15} />
                          {user.email}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={15} />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              setSelectedUser(user)
                            }
                            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#071A33] transition hover:bg-gray-50"
                          >
                            <Eye size={16} />
                            View
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(user.email)
                            }
                            disabled={
                              deletingEmail === user.email
                            }
                            className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={16} />

                            {deletingEmail === user.email
                              ? "Deleting..."
                              : "Delete"}
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 p-4 md:hidden">
            {loading ? (
              <div className="py-8 text-center text-sm text-gray-500">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                No users found.
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.email}
                  className="rounded-xl border border-gray-100 p-4"
                >
                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#071A33] text-white">
                      <User size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="font-medium text-[#071A33]">
                        {getDisplayName(user)}
                      </p>

                      <p className="mt-1 flex items-center gap-1 break-all text-xs text-gray-500">
                        <Mail size={13} />
                        {user.email}
                      </p>
                    </div>

                  </div>

                  <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={13} />
                    {formatDate(user.createdAt)}
                  </div>

                  <div className="mt-4 flex gap-2">

                    <button
                      onClick={() =>
                        setSelectedUser(user)
                      }
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm text-[#071A33] hover:bg-gray-50"
                    >
                      <Eye size={16} />
                      View
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(user.email)
                      }
                      disabled={
                        deletingEmail === user.email
                      }
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-50 py-2 text-sm text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      <Trash2 size={16} />

                      {deletingEmail === user.email
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">

            {/* Modal header */}
            <div className="mb-5 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#071A33] text-white">
                  <User size={18} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-[#071A33]">
                    User Details
                  </h2>

                  <p className="text-xs text-gray-500">
                    Customer information
                  </p>
                </div>

              </div>

              <button
                onClick={() =>
                  setSelectedUser(null)
                }
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>

            </div>

            {/* Customer information */}
            <div className="space-y-4">

              {/* Full Name */}
              <div className="flex items-start gap-3">
                <User
                  size={18}
                  className="mt-0.5 shrink-0 text-[#B8892D]"
                />

                <div className="min-w-0">
                  <p className="text-xs text-gray-500">
                    Full Name
                  </p>

                  <p className="font-medium text-[#071A33]">
                    {getDisplayName(selectedUser)}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <Mail
                  size={18}
                  className="mt-0.5 shrink-0 text-[#B8892D]"
                />

                <div className="min-w-0">
                  <p className="text-xs text-gray-500">
                    Email
                  </p>

                  <p className="break-all font-medium text-[#071A33]">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <Phone
                  size={18}
                  className="mt-0.5 shrink-0 text-[#B8892D]"
                />

                <div>
                  <p className="text-xs text-gray-500">
                    Phone
                  </p>

                  <p className="font-medium text-[#071A33]">
                    {selectedUser.phone || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-[#B8892D]"
                />

                <div className="min-w-0">
                  <p className="text-xs text-gray-500">
                    Address
                  </p>

                  <p className="font-medium leading-6 text-[#071A33]">
                    {selectedUser.address ||
                      "No address available"}
                  </p>
                </div>
              </div>

              {/* Joined */}
              <div className="flex items-start gap-3">
                <Calendar
                  size={18}
                  className="mt-0.5 shrink-0 text-[#B8892D]"
                />

                <div>
                  <p className="text-xs text-gray-500">
                    Joined
                  </p>

                  <p className="font-medium text-[#071A33]">
                    {formatDate(
                      selectedUser.createdAt
                    )}
                  </p>
                </div>
              </div>

              {/* Total Orders */}
              <div className="flex items-start gap-3">
                <ShoppingBag
                  size={18}
                  className="mt-0.5 shrink-0 text-[#B8892D]"
                />

                <div>
                  <p className="text-xs text-gray-500">
                    Total Orders
                  </p>

                  <p className="font-medium text-[#071A33]">
                    {selectedUser.orderCount ?? 0}
                  </p>
                </div>
              </div>

            </div>

            {/* Close */}
            <button
              onClick={() =>
                setSelectedUser(null)
              }
              className="mt-6 w-full rounded-lg bg-[#071A33] py-2.5 text-sm font-medium text-white transition hover:bg-[#102746]"
            >
              Close
            </button>

          </div>
        </div>
      )}
    </main>
  );
}