"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Search,
  Eye,
  Trash2,
  X,
  User,
  Calendar,
  MessageSquare,
  AtSign,
  Inbox,
  AlertCircle,
} from "lucide-react";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status?: string;
  createdAt: string;
};

export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [selectedMessage, setSelectedMessage] =
    useState<ContactMessage | null>(null);

  const [messageToDelete, setMessageToDelete] =
    useState<ContactMessage | null>(null);

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/contact", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load contact messages."
        );
      }

      setMessages(data.contacts || []);
    } catch (error) {
      console.error("Load contact messages error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load contact messages."
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteMessage() {
    if (!messageToDelete) return;

    try {
      setDeleting(true);

      const response = await fetch("/api/contact", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: messageToDelete.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to delete the message."
        );
      }

      setMessages((current) =>
        current.filter((item) => item.id !== messageToDelete.id)
      );

      if (selectedMessage?.id === messageToDelete.id) {
        setSelectedMessage(null);
      }

      setMessageToDelete(null);
    } catch (error) {
      console.error("Delete contact message error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete the message."
      );
    } finally {
      setDeleting(false);
    }
  }

  const filteredMessages = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return messages;
    }

    return messages.filter((item) => {
      return (
        item.name.toLowerCase().includes(value) ||
        item.email.toLowerCase().includes(value) ||
        item.subject.toLowerCase().includes(value) ||
        item.message.toLowerCase().includes(value)
      );
    });
  }, [messages, search]);

  const unreadCount = messages.filter(
    (item) => item.status === "unread"
  ).length;

  function formatDate(date: string) {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="min-h-screen bg-[#F8F4EC] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#071A33] text-[#E8B04A]">
                <Mail size={22} />
              </div>

              <div className="min-w-0">
                <h1 className="text-xl font-bold text-[#071A33] sm:text-2xl">
                  Contact Messages
                </h1>

                <p className="text-sm text-gray-500">
                  Manage messages received from customers.
                </p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
              <p className="text-xs text-gray-500">
                Total Messages
              </p>

              <p className="text-xl font-bold text-[#071A33]">
                {messages.length}
              </p>
            </div>

            <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
              <p className="text-xs text-gray-500">
                Unread
              </p>

              <p className="text-xl font-bold text-[#B8892D]">
                {unreadCount}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, subject or message..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-[#071A33] outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#E8B04A]" />

            <p className="mt-4 text-sm text-gray-500">
              Loading contact messages...
            </p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8F4EC] text-[#B8892D]">
              <Inbox size={30} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-[#071A33]">
              {search
                ? "No messages found"
                : "No contact messages"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              {search
                ? "Try another search term."
                : "Messages sent from the Contact Us page will appear here."}
            </p>
          </div>
        ) : (
          <>
            {/* ===================================================== */}
            {/* DESKTOP TABLE */}
            {/* ===================================================== */}
            <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-[#071A33] text-left">
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white">
                        Sender
                      </th>

                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white">
                        Subject
                      </th>

                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white">
                        Message
                      </th>

                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white">
                        Date
                      </th>

                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white">
                        Status
                      </th>

                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMessages.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 transition hover:bg-[#F8F4EC]/50"
                      >
                        {/* Sender */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#071A33] text-[#E8B04A]">
                              <User size={16} />
                            </div>

                            <div className="min-w-0 max-w-[190px]">
                              <p className="truncate text-sm font-semibold text-[#071A33]">
                                {item.name}
                              </p>

                              <p className="flex items-center gap-1 truncate text-xs text-gray-500">
                                <AtSign size={11} />
                                {item.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Subject */}
                        <td className="max-w-[180px] px-4 py-3">
                          <p className="truncate text-sm font-semibold text-[#071A33]">
                            {item.subject}
                          </p>
                        </td>

                        {/* Message */}
                        <td className="max-w-[280px] px-4 py-3">
                          <p className="line-clamp-2 text-sm text-gray-500">
                            {item.message}
                          </p>
                        </td>

                        {/* Date */}
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar size={14} />
                            {formatDate(item.createdAt)}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          {item.status === "unread" ? (
                            <span className="inline-flex items-center rounded-full bg-[#FFF3D6] px-2.5 py-1 text-xs font-semibold text-[#B8892D]">
                              Unread
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                              Read
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedMessage(item)
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#071A33] text-white transition hover:bg-[#E8B04A] hover:text-[#071A33]"
                              title="View message"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setMessageToDelete(item)
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                              title="Delete message"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-gray-100 px-4 py-3">
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-[#071A33]">
                    {filteredMessages.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-[#071A33]">
                    {messages.length}
                  </span>{" "}
                  messages
                </p>
              </div>
            </div>

            {/* ===================================================== */}
            {/* MOBILE CARDS */}
            {/* ===================================================== */}
            <div className="space-y-3 md:hidden">
              {filteredMessages.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white p-4 shadow-sm"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#071A33] text-[#E8B04A]">
                        <User size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#071A33]">
                          {item.name}
                        </p>

                        <p className="flex max-w-[210px] items-center gap-1 truncate text-xs text-gray-500">
                          <AtSign size={11} />
                          <span className="truncate">
                            {item.email}
                          </span>
                        </p>
                      </div>
                    </div>

                    {item.status === "unread" ? (
                      <span className="shrink-0 rounded-full bg-[#FFF3D6] px-2.5 py-1 text-[11px] font-semibold text-[#B8892D]">
                        Unread
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                        Read
                      </span>
                    )}
                  </div>

                  {/* Subject */}
                  <div className="mt-4 rounded-xl bg-[#F8F4EC] p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Subject
                    </p>

                    <p className="mt-1 break-words text-sm font-semibold text-[#071A33]">
                      {item.subject}
                    </p>
                  </div>

                  {/* Message */}
                  <div className="mt-3">
                    <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      <MessageSquare size={13} />
                      Message
                    </div>

                    <p className="line-clamp-3 break-words text-sm leading-6 text-gray-600">
                      {item.message}
                    </p>
                  </div>

                  {/* Date + Actions */}
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                    <div className="flex min-w-0 items-center gap-2 text-xs text-gray-500">
                      <Calendar size={14} className="shrink-0" />

                      <span className="truncate">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedMessage(item)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#071A33] text-white transition active:scale-95"
                        title="View message"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setMessageToDelete(item)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition active:scale-95"
                        title="Delete message"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Mobile counter */}
              <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-[#071A33]">
                    {filteredMessages.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-[#071A33]">
                    {messages.length}
                  </span>{" "}
                  messages
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ========================================================= */}
      {/* VIEW MESSAGE MODAL */}
      {/* ========================================================= */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#071A33] text-[#E8B04A]">
                  <MessageSquare size={19} />
                </div>

                <div>
                  <h2 className="font-bold text-[#071A33]">
                    Message Details
                  </h2>

                  <p className="text-xs text-gray-500">
                    Contact message
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-[#071A33]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal body */}
            <div className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-[#F8F4EC] p-4">
                  <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <User size={14} />
                    Name
                  </div>

                  <p className="break-words font-semibold text-[#071A33]">
                    {selectedMessage.name}
                  </p>
                </div>

                <div className="rounded-xl bg-[#F8F4EC] p-4">
                  <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <AtSign size={14} />
                    Email
                  </div>

                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="break-all font-semibold text-[#071A33] hover:text-[#B8892D]"
                  >
                    {selectedMessage.email}
                  </a>
                </div>
              </div>

              <div className="rounded-xl bg-[#F8F4EC] p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Subject
                </p>

                <p className="break-words font-semibold text-[#071A33]">
                  {selectedMessage.subject}
                </p>
              </div>

              <div className="rounded-xl bg-[#F8F4EC] p-4">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <Calendar size={14} />
                  Date
                </div>

                <p className="text-sm font-medium text-[#071A33]">
                  {formatDate(selectedMessage.createdAt)}
                </p>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <MessageSquare size={14} />
                  Message
                </p>

                <div className="whitespace-pre-wrap break-words rounded-xl border border-gray-200 bg-white p-4 text-sm leading-7 text-gray-700 sm:p-5">
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  setMessageToDelete(selectedMessage);
                  setSelectedMessage(null);
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {messageToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <Trash2 size={22} />
            </div>

            <h2 className="mt-4 text-xl font-bold text-[#071A33]">
              Delete Message?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to delete the message from{" "}
              <span className="font-semibold text-[#071A33]">
                {messageToDelete.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setMessageToDelete(null)}
                disabled={deleting}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteMessage}
                disabled={deleting}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}