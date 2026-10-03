
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  BookOpen,
  Search,
} from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

type Category = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
};

type Book = {
  id?: string;
  title?: string;
  category?: {
    S?: string;
  };
  [key: string]: any;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [books, setBooks] = useState<Book[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [saving, setSaving] = useState(false);

  // --------------------------------------------------
  // Load categories
  // --------------------------------------------------
  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load categories"
        );
      }

      setCategories(
        Array.isArray(data.categories)
          ? data.categories
          : []
      );
    } catch (err: any) {
      console.error("Categories error:", err);

      setError(
        err.message || "Failed to load categories."
      );
    }
  };

  // --------------------------------------------------
  // Load books
  // --------------------------------------------------
  const loadBooks = async () => {
    try {
      const response = await fetch("/api/books", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load books"
        );
      }

      setBooks(
        Array.isArray(data.books)
          ? data.books
          : []
      );
    } catch (err: any) {
      console.error("Books error:", err);

      setError(
        err.message || "Failed to load books."
      );
    }
  };

  // --------------------------------------------------
  // Load everything
  // --------------------------------------------------
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadCategories(),
        loadBooks(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --------------------------------------------------
  // Get book category from DynamoDB AttributeValue
  // --------------------------------------------------
  const getBookCategory = (book: Book) => {
    return String(book.category?.S || "")
      .trim()
      .toLowerCase();
  };

  // --------------------------------------------------
  // Count books in category
  // --------------------------------------------------
  const getBookCount = (categoryName: string) => {
    const normalizedCategory = categoryName
      .trim()
      .toLowerCase();

    return books.filter((book) => {
      return (
        getBookCategory(book) ===
        normalizedCategory
      );
    }).length;
  };

  // --------------------------------------------------
  // Filter categories
  // --------------------------------------------------
  const filteredCategories = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return categories;
    }

    return categories.filter((category) =>
      category.name.toLowerCase().includes(value)
    );
  }, [categories, search]);

  // --------------------------------------------------
  // Open add form
  // --------------------------------------------------
  const openAddForm = () => {
    setEditingCategory(null);

    setName("");
    setDescription("");
    setIcon("");

    setError("");
    setSuccess("");
    setShowEmojiPicker(false);

    setShowAddForm(true);
  };

  // --------------------------------------------------
  // Open edit form
  // --------------------------------------------------
  const openEditForm = (category: Category) => {
    setEditingCategory(category);

    setName(category.name);
    setDescription(category.description || "");
    setIcon(category.icon || "");

    setError("");
    setSuccess("");
    setShowEmojiPicker(false);

    setShowAddForm(true);
  };

  // --------------------------------------------------
  // Close form
  // --------------------------------------------------
  const closeForm = () => {
    setShowAddForm(false);

    setEditingCategory(null);

    setName("");
    setDescription("");
    setIcon("");

    setError("");
    setShowEmojiPicker(false);
  };

  // --------------------------------------------------
  // Select emoji
  // --------------------------------------------------
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setIcon(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // --------------------------------------------------
  // Submit category
  // --------------------------------------------------
  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // ----------------------------------------------
      // EDIT
      // ----------------------------------------------
      if (editingCategory) {
        const response = await fetch(
          "/api/categories",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: editingCategory.id,
              name: trimmedName,
              description: description.trim(),
              icon: icon.trim(),
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              "Failed to update category."
          );
        }

        setSuccess(
          "Category updated successfully."
        );
      }

      // ----------------------------------------------
      // ADD
      // ----------------------------------------------
      else {
        const response = await fetch(
          "/api/categories",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: trimmedName,
              description: description.trim(),
              icon: icon.trim(),
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              "Failed to add category."
          );
        }

        setSuccess(
          "Category added successfully."
        );
      }

      closeForm();

      await loadData();
    } catch (err: any) {
      console.error("Save category error:", err);

      setError(
        err.message || "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Delete category
  // --------------------------------------------------
  const handleDelete = async (
    category: Category
  ) => {
    const bookCount = getBookCount(category.name);

    if (bookCount > 0) {
      alert(
        `Cannot delete "${category.name}" because it contains ${bookCount} book${
          bookCount > 1 ? "s" : ""
        }.`
      );

      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/categories?id=${encodeURIComponent(
          category.id
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to delete category."
        );
      }

      setSuccess(
        "Category deleted successfully."
      );

      await loadCategories();
    } catch (err: any) {
      console.error("Delete category error:", err);

      setError(
        err.message ||
          "Failed to delete category."
      );
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F8F4EC] p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#071A33]">
            Categories
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Manage your book categories
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#071A33] px-5 py-3 font-medium text-white transition hover:bg-[#102746]"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* Add / Edit Form */}
      {showAddForm && (
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#071A33]">
                {editingCategory
                  ? "Edit Category"
                  : "Add Category"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {editingCategory
                  ? "Update the category information."
                  : "Create a new book category."}
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 md:grid-cols-3"
          >
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="e.g. History"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#B8892D]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>

              <input
                type="text"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Category description"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#B8892D]"
              />
            </div>

            {/* Icon */}
            <div className="relative">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Icon
              </label>

              <button
                type="button"
                onClick={() =>
                  setShowEmojiPicker(
                    (previous) => !previous
                  )
                }
                className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm outline-none transition hover:border-[#B8892D]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F8F4EC] text-xl">
                  {icon || "😀"}
                </span>

                <span className="text-gray-500">
                  {icon
                    ? "Change icon"
                    : "Choose an emoji"}
                </span>
              </button>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute left-0 top-full z-50 mt-2">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    width={320}
                    height={400}
                    searchDisabled={false}
                    skinTonesDisabled={false}
                    previewConfig={{
                      showPreview: false,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-end gap-3 md:col-span-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#071A33] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#102746] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingCategory
                  ? "Save Changes"
                  : "Add Category"}
              </button>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#B8892D]"
          />
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">
          Loading categories...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
          <BookOpen
            size={42}
            className="mx-auto mb-3 text-gray-300"
          />

          <p className="font-medium text-[#071A33]">
            No categories found
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Add your first category to get started.
          </p>
        </div>
      ) : (
        /* Category cards */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCategories.map((category) => {
            const bookCount = getBookCount(
              category.name
            );

            return (
              <div
                key={category.id}
                className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                {/* Card top */}
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F8F4EC] text-2xl">
                    {category.icon || "📚"}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() =>
                        openEditForm(category)
                      }
                      className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-[#071A33]"
                      title="Edit category"
                    >
                      <Pencil size={17} />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(category)
                      }
                      className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                      title="Delete category"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>

                {/* Name */}
                <h2 className="text-lg font-semibold text-[#071A33]">
                  {category.name}
                </h2>

                {/* Description */}
                {category.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                    {category.description}
                  </p>
                )}

                {/* Book count */}
                <div className="mt-4 flex items-center gap-2">
                  <BookOpen
                    size={16}
                    className="text-[#B8892D]"
                  />

                  <span className="text-sm font-medium text-gray-600">
                    {bookCount}{" "}
                    {bookCount === 1
                      ? "book"
                      : "books"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
