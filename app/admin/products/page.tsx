"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Package,
  Image as ImageIcon,
} from "lucide-react";

type Book = {
  id: string;
  title: string;
  author: string;
  price: number;
  category: string;
  stock: number;
  description?: string;
  image?: string;
};

type Category = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
};

type BookForm = {
  title: string;
  author: string;
  price: string;
  category: string;
  stock: string;
  description: string;
  image: File | null;
};

const emptyForm: BookForm = {
  title: "",
  author: "",
  price: "",
  category: "",
  stock: "",
  description: "",
  image: null,
};

export default function AdminProductsPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<BookForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchBooks() {
    try {
      const response = await fetch("/api/books", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to load books."
        );
      }

      const rawBooks = Array.isArray(data.books)
        ? data.books
        : [];

      const formattedBooks: Book[] = rawBooks.map(
        (item: any) => ({
          id: item.id?.S ?? item.id ?? "",
          title: item.title?.S ?? item.title ?? "",
          author: item.author?.S ?? item.author ?? "",
          price: Number(
            item.price?.N ?? item.price ?? 0
          ),
          category:
            item.category?.S ??
            item.category ??
            "",
          stock: Number(
            item.stock?.N ?? item.stock ?? 0
          ),
          description:
            item.description?.S ??
            item.description ??
            "",
          image:
            item.image?.S ??
            item.image ??
            "",
        })
      );

      setBooks(formattedBooks);
    } catch (err) {
      console.error(
        "Failed to fetch books:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load books."
      );
    }
  }

  async function fetchCategories() {
    try {
      const response = await fetch(
        "/api/categories",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to load categories."
        );
      }

      const loadedCategories: Category[] =
        Array.isArray(data.categories)
          ? data.categories
          : [];

      setCategories(loadedCategories);

      // Keep the selected category if it still exists.
      // Otherwise, select the first available category.
      setForm((current) => {
        if (
          current.category &&
          loadedCategories.some(
            (category) =>
              category.name ===
              current.category
          )
        ) {
          return current;
        }

        return {
          ...current,
          category:
            loadedCategories[0]?.name || "",
        };
      });
    } catch (err) {
      console.error(
        "Failed to fetch categories:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load categories."
      );
    }
  }

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchBooks(),
        fetchCategories(),
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setForm({
      ...emptyForm,
      category:
        categories[0]?.name || "",
    });

    setEditingId(null);
  }

  function startEdit(book: Book) {
    setEditingId(book.id);

    setForm({
      title: book.title,
      author: book.author,
      price: String(book.price),
      category: book.category,
      stock: String(book.stock),
      description: book.description || "",
      image: null,
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEdit() {
    resetForm();
    setError("");
  }

  function handleInputChange(
    field: keyof BookForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0] || null;

    setForm((current) => ({
      ...current,
      image: file,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const title = form.title.trim();
    const author = form.author.trim();
    const description =
      form.description.trim();
    const category = form.category.trim();

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!title) {
      setError("Book title is required.");
      return;
    }

    if (!author) {
      setError("Author is required.");
      return;
    }

    if (!category) {
      setError(
        "Please select a category."
      );
      return;
    }

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      setError(
        "Price must be greater than 0."
      );
      return;
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError(
        "Stock must be a whole number greater than or equal to 0."
      );
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      if (editingId) {
        formData.append(
          "id",
          editingId
        );
      }

      formData.append(
        "title",
        title
      );

      formData.append(
        "author",
        author
      );

      formData.append(
        "price",
        String(price)
      );

      formData.append(
        "category",
        category
      );

      formData.append(
        "stock",
        String(stock)
      );

      formData.append(
        "description",
        description
      );

      if (form.image) {
        formData.append(
          "image",
          form.image
        );
      }

      const response = await fetch(
        "/api/books",
        {
          method: editingId
            ? "PUT"
            : "POST",
          body: formData,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            (editingId
              ? "Failed to update book."
              : "Failed to create book.")
        );
      }

      setSuccess(
        editingId
          ? "Book updated successfully."
          : "Book created successfully."
      );

      resetForm();

      await fetchBooks();
    } catch (err) {
      console.error(
        "Book save error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        "/api/books",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: deleteId,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to delete book."
        );
      }

      setSuccess(
        "Book deleted successfully."
      );

      setDeleteId(null);

      if (editingId === deleteId) {
        resetForm();
      }

      await fetchBooks();
    } catch (err) {
      console.error(
        "Book delete error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete book."
      );

      setDeleteId(null);
    }
  }

  const filteredBooks =
    books.filter((book) => {
      const searchValue =
        search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        book.title
          .toLowerCase()
          .includes(searchValue) ||
        book.author
          .toLowerCase()
          .includes(searchValue);

      const matchesCategory =
        categoryFilter === "All" ||
        book.category ===
          categoryFilter;

      return (
        matchesSearch &&
        matchesCategory
      );
    });

  return (
    <div className="min-h-screen bg-[#F8F4EC] px-6 py-8 text-[#071A33]">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Products
            </h1>

            <p className="mt-2 text-sm text-[#071A33]/60">
              Add, edit and manage the books available in
              your bookstore.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm shadow-sm">
            <Package size={17} />

            <span className="font-medium">
              {books.length}{" "}
              {books.length === 1
                ? "book"
                : "books"}
            </span>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-start justify-between gap-4">
              <span>{error}</span>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="shrink-0 text-red-500 transition hover:text-red-700"
              >
                <X size={17} />
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <div className="flex items-start justify-between gap-4">
              <span>{success}</span>

              <button
                type="button"
                onClick={() =>
                  setSuccess("")
                }
                className="shrink-0 text-green-600 transition hover:text-green-800"
              >
                <X size={17} />
              </button>
            </div>
          </div>
        )}

        {/* Add / Edit Form */}
        <section className="mb-10 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {editingId
                  ? "Edit Book"
                  : "Add New Book"}
              </h2>

              <p className="mt-1 text-sm text-[#071A33]/55">
                {editingId
                  ? "Update the selected book."
                  : "Create a new book for your store."}
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#071A33]/70 transition hover:bg-[#F8F4EC]"
              >
                <X size={16} />
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">

              {/* Title */}
              <div>
                <label
                  htmlFor="book-title"
                  className="mb-2 block text-sm font-medium"
                >
                  Title
                </label>

                <input
                  id="book-title"
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    handleInputChange(
                      "title",
                      event.target.value
                    )
                  }
                  placeholder="Book title"
                  className="w-full rounded-xl border border-[#071A33]/10 bg-[#F8F4EC]/40 px-4 py-3 text-sm outline-none transition placeholder:text-[#071A33]/35 focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
                />
              </div>

              {/* Author */}
              <div>
                <label
                  htmlFor="book-author"
                  className="mb-2 block text-sm font-medium"
                >
                  Author
                </label>

                <input
                  id="book-author"
                  type="text"
                  value={form.author}
                  onChange={(event) =>
                    handleInputChange(
                      "author",
                      event.target.value
                    )
                  }
                  placeholder="Author name"
                  className="w-full rounded-xl border border-[#071A33]/10 bg-[#F8F4EC]/40 px-4 py-3 text-sm outline-none transition placeholder:text-[#071A33]/35 focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
                />
              </div>

              {/* Price */}
              <div>
                <label
                  htmlFor="book-price"
                  className="mb-2 block text-sm font-medium"
                >
                  Price (DZD)
                </label>

                <input
                  id="book-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    handleInputChange(
                      "price",
                      event.target.value
                    )
                  }
                  placeholder="2500"
                  className="w-full rounded-xl border border-[#071A33]/10 bg-[#F8F4EC]/40 px-4 py-3 text-sm outline-none transition placeholder:text-[#071A33]/35 focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
                />
              </div>

              {/* Stock */}
              <div>
                <label
                  htmlFor="book-stock"
                  className="mb-2 block text-sm font-medium"
                >
                  Stock
                </label>

                <input
                  id="book-stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(event) =>
                    handleInputChange(
                      "stock",
                      event.target.value
                    )
                  }
                  placeholder="10"
                  className="w-full rounded-xl border border-[#071A33]/10 bg-[#F8F4EC]/40 px-4 py-3 text-sm outline-none transition placeholder:text-[#071A33]/35 focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
                />
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="book-category"
                  className="mb-2 block text-sm font-medium"
                >
                  Category
                </label>

                <select
                  id="book-category"
                  value={form.category}
                  onChange={(event) =>
                    handleInputChange(
                      "category",
                      event.target.value
                    )
                  }
                  disabled={
                    categories.length === 0
                  }
                  required
                  className="w-full rounded-xl border border-[#071A33]/10 bg-[#F8F4EC]/40 px-4 py-3 text-sm outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {categories.length === 0 ? (
                    <option value="">
                      No categories available
                    </option>
                  ) : (
                    categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.name}
                        >
                          {category.name}
                        </option>
                      )
                    )
                  )}
                </select>
              </div>

              {/* Image */}
              <div>
                <label
                  htmlFor="book-image"
                  className="mb-2 block text-sm font-medium"
                >
                  Book Image
                </label>

                <input
                  id="book-image"
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImageChange
                  }
                  className="w-full rounded-xl border border-[#071A33]/10 bg-[#F8F4EC]/40 px-4 py-2.5 text-sm outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-[#071A33] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
                />

                {editingId && (
                  <p className="mt-2 text-xs text-[#071A33]/45">
                    Leave empty to keep the current image.
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label
                  htmlFor="book-description"
                  className="mb-2 block text-sm font-medium"
                >
                  Description
                </label>

                <textarea
                  id="book-description"
                  value={form.description}
                  onChange={(event) =>
                    handleInputChange(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Book description"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-[#071A33]/10 bg-[#F8F4EC]/40 px-4 py-3 text-sm outline-none transition placeholder:text-[#071A33]/35 focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="mt-7 flex justify-end">
              <button
                type="submit"
                disabled={
                  saving ||
                  categories.length === 0
                }
                className="flex items-center gap-2 rounded-xl bg-[#071A33] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#071A33]/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {editingId ? (
                  <Pencil size={17} />
                ) : (
                  <Plus size={17} />
                )}

                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Book"
                    : "Add Book"}
              </button>
            </div>
          </form>
        </section>

        {/* Filters */}
        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">

            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#071A33]/40"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search by title or author..."
                className="w-full rounded-xl border border-[#071A33]/10 bg-[#F8F4EC]/40 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#071A33]/35 focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-[#071A33]/10 bg-[#F8F4EC]/40 px-4 py-3 text-sm outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
            >
              <option value="All">
                All Categories
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.name}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>
          </div>
        </section>

        {/* Products */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-semibold">
              All Books
            </h2>

            <p className="mt-1 text-sm text-[#071A33]/55">
              {filteredBooks.length}{" "}
              {filteredBooks.length === 1
                ? "book"
                : "books"}{" "}
              displayed.
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-sm">
              <p className="text-sm text-[#071A33]/60">
                Loading books...
              </p>
            </div>
          ) : filteredBooks.length ===
            0 ? (
            <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F8F4EC]">
                <Package
                  size={25}
                  className="text-[#071A33]/50"
                />
              </div>

              <h3 className="text-lg font-semibold">
                No books found
              </h3>

              <p className="mt-2 text-sm text-[#071A33]/55">
                Try another search or category.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredBooks.map(
                (book) => (
                  <div
                    key={book.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {/* Image */}
                    <div className="relative flex h-56 items-center justify-center bg-[#F8F4EC]">
                      {book.image ? (
                        <img
                          src={book.image}
                          alt={book.title}
                          className="h-full w-full object-contain p-5"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-[#071A33]/35">
                          <ImageIcon
                            size={35}
                          />

                          <span className="text-xs">
                            No image
                          </span>
                        </div>
                      )}

                      <div className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-medium shadow-sm">
                        {book.category}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="line-clamp-2 min-h-[48px] text-base font-semibold">
                        {book.title}
                      </h3>

                      <p className="mt-1 text-sm text-[#071A33]/55">
                        {book.author}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-lg font-semibold text-[#B8892D]">
                          {book.price.toLocaleString()}{" "}
                          DZD
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            book.stock ===
                            0
                              ? "bg-red-50 text-red-600"
                              : book.stock <=
                                5
                                ? "bg-orange-50 text-orange-600"
                                : "bg-green-50 text-green-600"
                          }`}
                        >
                          {book.stock ===
                          0
                            ? "Out of stock"
                            : `${book.stock} in stock`}
                        </span>
                      </div>

                      {book.description && (
                        <p className="mt-4 line-clamp-3 text-sm leading-5 text-[#071A33]/55">
                          {
                            book.description
                          }
                        </p>
                      )}

                      {/* Actions */}
                      <div className="mt-5 flex gap-2 border-t border-[#071A33]/5 pt-4">
                        <button
                          type="button"
                          onClick={() =>
                            startEdit(
                              book
                            )
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#071A33]/10 px-3 py-2 text-sm font-medium transition hover:border-[#E8B04A] hover:bg-[#E8B04A]/10"
                        >
                          <Pencil
                            size={15}
                          />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDeleteId(
                              book.id
                            );
                            setError("");
                            setSuccess("");
                          }}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2
                            size={15}
                          />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071A33]/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Delete Book?
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#071A33]/60">
                  Are you sure you want to delete this book?
                  This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDeleteId(null)
                }
                className="rounded-lg p-2 text-[#071A33]/50 transition hover:bg-[#F8F4EC] hover:text-[#071A33]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteId(null)
                }
                className="rounded-xl border border-[#071A33]/10 px-4 py-2.5 text-sm font-medium transition hover:bg-[#F8F4EC]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
              >
                <Trash2 size={16} />
                Delete Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}