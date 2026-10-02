"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type Book = {
  id: string;
  title: string;
  author: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  image: string;
};

type BookForm = {
  id: string;
  title: string;
  author: string;
  price: string;
  category: string;
  description: string;
  stock: string;
  image: File | null;
};

const categories = [
  "Novels",
  "Computer Science",
  "Mathematics",
  "Science",
  "History",
];

export default function AdminProductsPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [showAddForm, setShowAddForm] = useState(false);

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editingBookId, setEditingBookId] = useState("");
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  const [existingImage, setExistingImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const [message, setMessage] = useState("");

  const [form, setForm] = useState<BookForm>({
    id: "",
    title: "",
    author: "",
    price: "",
    category: "Novels",
    description: "",
    stock: "0",
    image: null,
  });

  // --------------------------------------------------
  // Fetch books
  // --------------------------------------------------

  async function fetchBooks() {
    try {
      setLoading(true);

      const response = await fetch("/api/books", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch books.");
      }

      const formattedBooks: Book[] = (data.books || []).map(
        (item: any) => ({
          id: item.id?.S || "",
          title: item.title?.S || "",
          author: item.author?.S || "",
          price: Number(item.price?.N || 0),
          category: item.category?.S || "",
          description: item.description?.S || "",
          stock: Number(item.stock?.N || 0),
          image: item.image?.S || "",
        })
      );

      setBooks(formattedBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
      setMessage("Failed to load books.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  // --------------------------------------------------
  // Form handlers
  // --------------------------------------------------

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] || null;

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG and WEBP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setForm((previous) => ({
      ...previous,
      image: file,
    }));

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  function removeSelectedImage() {
    setForm((previous) => ({
      ...previous,
      image: null,
    }));

    setImagePreview(existingImage);
  }

  // --------------------------------------------------
  // Reset form
  // --------------------------------------------------

  function resetForm() {
    setForm({
      id: "",
      title: "",
      author: "",
      price: "",
      category: "Novels",
      description: "",
      stock: "0",
      image: null,
    });

    setEditingBookId("");
    setExistingImage("");
    setImagePreview("");
    setMessage("");
    setEditing(false);
  }

  // --------------------------------------------------
  // Add book
  // --------------------------------------------------

  async function handleAddBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setAdding(true);
      setMessage("");

      const formData = new FormData();

      formData.append("id", form.id);
      formData.append("title", form.title);
      formData.append("author", form.author);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("description", form.description);
      formData.append("stock", form.stock);

      if (form.image) {
        formData.append("image", form.image);
      }

      const response = await fetch("/api/books", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Failed to add book.");
        return;
      }

      setMessage("Book added successfully!");

      resetForm();

      await fetchBooks();

      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding book:", error);
      setMessage("Something went wrong while adding the book.");
    } finally {
      setAdding(false);
    }
  }

  // --------------------------------------------------
  // Start editing
  // --------------------------------------------------

  function startEditBook(book: Book) {
    setEditing(true);
    setEditingBookId(book.id);

    setExistingImage(book.image || "");
    setImagePreview(book.image || "");

    setForm({
      id: book.id,
      title: book.title,
      author: book.author,
      price: String(book.price),
      category: book.category,
      description: book.description,
      stock: String(book.stock),
      image: null,
    });

    setMessage("");
    setShowAddForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // --------------------------------------------------
  // Edit book
  // --------------------------------------------------

  async function handleEditBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setAdding(true);
      setMessage("");

      const formData = new FormData();

      formData.append("id", form.id);
      formData.append("title", form.title);
      formData.append("author", form.author);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("description", form.description);
      formData.append("stock", form.stock);
      formData.append("existingImage", existingImage);

      if (form.image) {
        formData.append("image", form.image);
      }

      const response = await fetch("/api/books", {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Failed to update book.");
        return;
      }

      setMessage("Book updated successfully!");

      resetForm();

      await fetchBooks();

      setShowAddForm(false);
    } catch (error) {
      console.error("Error updating book:", error);
      setMessage("Something went wrong while updating the book.");
    } finally {
      setAdding(false);
    }
  }

  // --------------------------------------------------
  // Delete book
  // --------------------------------------------------

  async function handleDeleteBook() {
    if (!bookToDelete?.id) {
      return;
    }

    try {
      setDeleting(true);

      const response = await fetch("/api/books", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: bookToDelete.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to delete the book.");
        return;
      }

      setBookToDelete(null);

      await fetchBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
      alert("Something went wrong while deleting the book.");
    } finally {
      setDeleting(false);
    }
  }

  // --------------------------------------------------
  // Search + category filter
  // --------------------------------------------------

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        book.title.toLowerCase().includes(searchValue) ||
        book.author.toLowerCase().includes(searchValue) ||
        book.category.toLowerCase().includes(searchValue);

      const matchesCategory =
        category === "All" || book.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [books, search, category]);

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-[#F8F4EC] px-4 py-8 text-[#071A33] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-[#B8892D]">
              Administration
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Products
            </h1>

            <p className="mt-2 text-gray-600">
              Manage your bookstore products.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowAddForm(true);

              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            className="rounded-lg bg-[#071A33] px-5 py-3 font-semibold text-white transition hover:bg-[#102B4F]"
          >
            + Add Book
          </button>
        </div>

        {/* Add / Edit form */}
        {showAddForm && (
          <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {editing ? "Edit Book" : "Add New Book"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editing
                    ? "Update the book information."
                    : "Add a new book to your bookstore."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowAddForm(false);
                }}
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {message && (
              <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                {message}
              </div>
            )}

            <form
              onSubmit={
                editing ? handleEditBook : handleAddBook
              }
              className="grid gap-5 md:grid-cols-2"
            >
              {/* ID */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Book ID
                </label>

                <input
                  type="text"
                  name="id"
                  value={form.id}
                  onChange={handleChange}
                  disabled={editing}
                  placeholder="BOOK-001"
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#B8892D] disabled:bg-gray-100"
                />
              </div>

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Book title"
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#B8892D]"
                />
              </div>

              {/* Author */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Author
                </label>

                <input
                  type="text"
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  placeholder="Author name"
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#B8892D]"
                />
              </div>

              {/* Price */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Price (DZD)
                </label>

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  min="1"
                  placeholder="2500"
                  required
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#B8892D]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#B8892D]"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Stock
                </label>

                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  min="0"
                  placeholder="10"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#B8892D]"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Book description..."
                  className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#B8892D]"
                />
              </div>

              {/* Image */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold">
                  Book Cover
                </label>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
                />

                <p className="mt-2 text-xs text-gray-500">
                  JPG, PNG or WEBP. Maximum size: 5 MB.
                </p>

                {imagePreview && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-gray-600">
                      Image preview
                    </p>

                    <div className="relative h-48 w-32 overflow-hidden rounded-lg border border-gray-200">
                      <img
                        src={imagePreview}
                        alt="Book preview"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {form.image && (
                      <button
                        type="button"
                        onClick={removeSelectedImage}
                        className="mt-2 text-sm font-medium text-red-600 hover:underline"
                      >
                        Remove selected image
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={adding}
                  className="rounded-lg bg-[#071A33] px-6 py-3 font-semibold text-white hover:bg-[#102B4F] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {adding
                    ? editing
                      ? "Saving..."
                      : "Adding..."
                    : editing
                    ? "Save Changes"
                    : "Add Book"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowAddForm(false);
                  }}
                  disabled={adding}
                  className="rounded-lg border border-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Search and filters */}
        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by title, author or category..."
                className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#B8892D]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Category
              </label>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#B8892D]"
              >
                <option value="All">All Categories</option>

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Products table */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  All Books
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {filteredBooks.length} book
                  {filteredBooks.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-gray-500">
              Loading books...
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-lg font-semibold text-gray-700">
                No books found
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Try another search or category.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Book
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Author
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Category
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Price
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Stock
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredBooks.map((book) => (
                    <tr
                      key={book.id}
                      className="transition hover:bg-gray-50"
                    >
                      {/* Book */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {book.image ? (
                              <img
                                src={book.image}
                                alt={book.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-gray-400">
                                No image
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-[#071A33]">
                              {book.title}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              ID: {book.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {book.author}
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-[#F8F4EC] px-3 py-1 text-xs font-medium text-[#071A33]">
                          {book.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 text-sm font-semibold text-[#071A33]">
                        {book.price.toLocaleString()} DZD
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4">
                        <span
                          className={
                            book.stock > 0
                              ? "text-sm font-medium text-green-600"
                              : "text-sm font-medium text-red-600"
                          }
                        >
                          {book.stock}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              startEditBook(book)
                            }
                            className="rounded-lg border border-[#071A33]/20 px-3 py-2 text-sm font-medium text-[#071A33] hover:bg-[#F8F4EC]"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setBookToDelete(book)
                            }
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Delete Confirmation Modal */}
      {bookToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {/* Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
              🗑️
            </div>

            {/* Title */}
            <h2 className="mt-4 text-center text-xl font-bold text-[#071A33]">
              Delete Book?
            </h2>

            {/* Message */}
            <p className="mt-2 text-center text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[#071A33]">
                "{bookToDelete.title}"
              </span>
              ?
            </p>

            <p className="mt-2 text-center text-sm text-gray-500">
              This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setBookToDelete(null)}
                disabled={deleting}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteBook}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}