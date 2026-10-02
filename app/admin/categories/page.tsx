"use client";

import { useEffect, useMemo, useState } from "react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Category = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
};

const allIcons = Object.entries(LucideIcons).filter(
  ([name, value]) => {
    if (name === "default") return false;
    if (name === "createLucideIcon") return false;
    if (name === "IconNode") return false;
    if (name === "Icon") return false;

    return (
      /^[A-Z]/.test(name) &&
      (typeof value === "function" ||
        (typeof value === "object" && value !== null))
    );
  }
) as [string, LucideIcon][];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("BookOpen");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [iconSearch, setIconSearch] = useState("");
  const [showIconLibrary, setShowIconLibrary] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filteredIcons = useMemo(() => {
    const search = iconSearch.toLowerCase().trim();

    if (!search) {
      return allIcons;
    }

    return allIcons.filter(([iconName]) =>
      iconName.toLowerCase().includes(search)
    );
  }, [iconSearch]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/categories", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load categories."
        );
      }

      setCategories(
        Array.isArray(data.categories)
          ? data.categories
          : []
      );
    } catch (err) {
      console.error("Categories error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setSelectedIcon("BookOpen");
    setEditingId(null);
    setIconSearch("");
    setShowIconLibrary(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const cleanName = name.trim();
    const cleanDescription = description.trim();

    if (!cleanName) {
      setError("Category name is required.");
      return;
    }

    if (!cleanDescription) {
      setError("Category description is required.");
      return;
    }

    if (!selectedIcon) {
      setError("Please select an icon.");
      return;
    }

    try {
      const response = await fetch("/api/categories", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingId
            ? {
                id: editingId,
                name: cleanName,
                description: cleanDescription,
                icon: selectedIcon,
              }
            : {
                name: cleanName,
                description: cleanDescription,
                icon: selectedIcon,
              }
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (editingId
              ? "Failed to update category."
              : "Failed to create category.")
        );
      }

      setMessage(
        editingId
          ? "Category updated successfully."
          : "Category added successfully."
      );

      resetForm();
      await loadCategories();
    } catch (err) {
      console.error("Save category error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || "");
    setSelectedIcon(category.icon || "BookOpen");

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/categories?id=${encodeURIComponent(deleteId)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete category."
        );
      }

      setMessage("Category deleted successfully.");
      setDeleteId(null);

      await loadCategories();
    } catch (err) {
      console.error("Delete category error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete category."
      );

      setDeleteId(null);
    }
  };

  const getIcon = (iconName?: string): LucideIcon => {
    if (!iconName) {
      return LucideIcons.BookOpen;
    }

    const icon =
      LucideIcons[
        iconName as keyof typeof LucideIcons
      ];

    if (
      typeof icon === "function" ||
      (typeof icon === "object" && icon !== null)
    ) {
      return icon as LucideIcon;
    }

    return LucideIcons.BookOpen;
  };

  const SelectedIcon = getIcon(selectedIcon);

  return (
    <div className="min-h-screen bg-[#F8F4EC] px-4 py-8 text-[#071A33] md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Categories
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Manage your bookstore categories.
            </p>
          </div>

          <button
            type="button"
            onClick={loadCategories}
            className="rounded-lg border border-[#071A33]/20 bg-white px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Add / Edit Form */}
        <div className="mb-10 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold">
              {editingId
                ? "Edit Category"
                : "Add Category"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {editingId
                ? "Update the category information."
                : "Create a new bookstore category."}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Category Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Example: History"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Example: Books about historical events, civilizations and important figures."
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Category Icon
              </label>

              <button
                type="button"
                onClick={() =>
                  setShowIconLibrary(!showIconLibrary)
                }
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 transition hover:border-[#E8B04A]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#071A33] text-[#E8B04A]">
                    <SelectedIcon size={24} />
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-semibold">
                      {selectedIcon}
                    </p>

                    <p className="text-xs text-gray-500">
                      Click to choose an icon
                    </p>
                  </div>
                </div>

                <span className="text-sm text-gray-500">
                  {showIconLibrary
                    ? "Hide"
                    : "Browse"}
                </span>
              </button>

              {/* Icon Library */}
              {showIconLibrary && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  {/* Search */}
                  <div className="mb-4">
                    <input
                      type="text"
                      value={iconSearch}
                      onChange={(e) =>
                        setIconSearch(e.target.value)
                      }
                      placeholder="Search icons... Example: book, heart, home, user"
                      className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
                    />
                  </div>

                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {filteredIcons.length} icons available
                    </p>

                    {iconSearch && (
                      <button
                        type="button"
                        onClick={() =>
                          setIconSearch("")
                        }
                        className="text-xs font-medium text-[#B8892D] hover:underline"
                      >
                        Clear search
                      </button>
                    )}
                  </div>

                  {/* Icons Grid */}
                  <div className="max-h-[420px] overflow-y-auto rounded-lg bg-white p-3">
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
                      {filteredIcons.map(
                        ([iconName, IconComponent]) => (
                          <button
                            key={iconName}
                            type="button"
                            title={iconName}
                            onClick={() => {
                              setSelectedIcon(
                                iconName
                              );
                              setShowIconLibrary(false);
                            }}
                            className={`group flex aspect-square flex-col items-center justify-center rounded-lg border p-2 transition ${
                              selectedIcon === iconName
                                ? "border-[#E8B04A] bg-[#E8B04A]/15 text-[#071A33]"
                                : "border-gray-100 bg-white hover:border-[#E8B04A] hover:bg-[#F8F4EC]"
                            }`}
                          >
                            <IconComponent
                              size={22}
                              strokeWidth={1.8}
                            />

                            <span className="mt-1 w-full truncate text-center text-[9px] text-gray-500 group-hover:text-[#071A33]">
                              {iconName}
                            </span>
                          </button>
                        )
                      )}
                    </div>

                    {filteredIcons.length === 0 && (
                      <div className="py-12 text-center text-sm text-gray-500">
                        No icons found.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="rounded-lg bg-[#071A33] px-6 py-3 font-semibold text-white transition hover:bg-[#10294A]"
              >
                {editingId
                  ? "Update Category"
                  : "Add Category"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-200 bg-white px-6 py-3 font-semibold text-[#071A33] transition hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Categories */}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                All Categories
              </h2>

              <p className="text-sm text-gray-500">
                {categories.length} categories
              </p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#071A33]" />

              <p className="text-sm text-gray-500">
                Loading categories...
              </p>
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
              <LucideIcons.FolderOpen
                size={45}
                className="mx-auto mb-4 text-gray-400"
              />

              <h3 className="font-semibold">
                No categories found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Add your first category above.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const CategoryIcon = getIcon(
                  category.icon
                );

                return (
                  <div
                    key={category.id}
                    className="group rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    {/* Top */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#071A33] text-[#E8B04A]">
                        <CategoryIcon size={28} />
                      </div>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                        {category.id}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="mt-5">
                      <h3 className="text-lg font-bold">
                        {category.name}
                      </h3>

                      <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-500">
                        {category.description ||
                          "No description available."}
                      </p>

                      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                        <LucideIcons.Tag size={14} />

                        <span>
                          {category.icon ||
                            "BookOpen"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(category)
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#071A33]/15 px-4 py-2.5 text-sm font-medium transition hover:bg-[#F8F4EC]"
                      >
                        <LucideIcons.Pencil
                          size={16}
                        />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteId(category.id)
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <LucideIcons.Trash2
                          size={16}
                        />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <LucideIcons.TriangleAlert
                size={28}
              />
            </div>

            <h2 className="mt-5 text-center text-xl font-bold text-[#071A33]">
              Delete Category?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-gray-500">
              Are you sure you want to delete this
              category? This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-3 font-medium transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}