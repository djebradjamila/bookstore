"use client";

import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Search,
  Package,
  Pencil,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Tag,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";

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

type Category = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
};

type BookForm = {
  id: string;
  title: string;
  author: string;
  price: string;
  category: string;
  description: string;
  stock: string;
  image: File | string | null;
};

const emptyForm: BookForm = {
  id: "",
  title: "",
  author: "",
  price: "",
  category: "",
  description: "",
  stock: "",
  image: null,
};

export default function AdminProductsPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState<BookForm>(emptyForm);
  const [selectedImageName, setSelectedImageName] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const formRef = useRef<HTMLDivElement | null>(null);

  /* =========================================================
     FETCH BOOKS
  ========================================================= */

  const fetchBooks = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/books", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }

      const data = await response.json();

      const rawBooks = data.books || [];

      const formattedBooks: Book[] = rawBooks.map((book: any) => ({
        id: book.id?.S ?? book.id ?? "",
        title: book.title?.S ?? book.title ?? "",
        author: book.author?.S ?? book.author ?? "",
        price: Number(book.price?.N ?? book.price ?? 0),
        category: book.category?.S ?? book.category ?? "",
        description: book.description?.S ?? book.description ?? "",
        stock: Number(book.stock?.N ?? book.stock ?? 0),
        image: book.image?.S ?? book.image ?? "",
      }));

      setBooks(formattedBooks);
    } catch (err) {
      console.error(err);
      setError("Unable to load books.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     FETCH CATEGORIES
  ========================================================= */

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);

      const response = await fetch("/api/categories", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();

      const rawCategories = data.categories || [];

      const formattedCategories: Category[] = rawCategories.map(
        (category: any) => ({
          id: category.id?.S ?? category.id ?? "",
          name: category.name?.S ?? category.name ?? "",
          description:
            category.description?.S ?? category.description ?? "",
          icon: category.icon?.S ?? category.icon ?? "",
        })
      );

      setCategories(formattedCategories);
    } catch (err) {
      console.error(err);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  /* =========================================================
     HELPERS
  ========================================================= */

  const resetForm = () => {
    setForm(emptyForm);
    setSelectedImageName("");
    setEditing(false);
  };

  const openAddForm = () => {
    resetForm();
    setMessage("");
    setError("");
    setShowForm(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const openEditForm = (book: Book) => {
    setEditing(true);

    setForm({
      id: book.id,
      title: book.title,
      author: book.author,
      price: String(book.price),
      category: book.category,
      description: book.description,
      stock: String(book.stock),
      image: book.image || null,
    });

    setSelectedImageName("");

    setMessage("");
    setError("");
    setShowForm(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const closeForm = () => {
    if (submitting) return;

    setShowForm(false);
    resetForm();
    setMessage("");
    setError("");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("The image must be smaller than 5 MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setForm((prev) => ({
      ...prev,
      image: file,
    }));

    setSelectedImageName(file.name);
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!form.title.trim()) {
      setError("Please enter the book title.");
      return;
    }

    if (!form.author.trim()) {
      setError("Please enter the author.");
      return;
    }

    if (!form.price || Number(form.price) < 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (!form.category) {
      setError("Please select a category.");
      return;
    }

    if (!form.stock || Number(form.stock) < 0) {
      setError("Please enter a valid stock quantity.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      if (editing && form.id) {
        formData.append("id", form.id);
      }

      formData.append("title", form.title.trim());
      formData.append("author", form.author.trim());
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("description", form.description.trim());
      formData.append("stock", form.stock);

      if (form.image instanceof File) {
        formData.append("image", form.image);
      } else if (typeof form.image === "string" && form.image) {
        formData.append("existingImage", form.image);
      }

      const response = await fetch("/api/books", {
        method: editing ? "PUT" : "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Unable to save the book."
        );
      }

      setMessage(
        editing
          ? "Book updated successfully."
          : "Book added successfully."
      );

      await fetchBooks();

      resetForm();

      setTimeout(() => {
        setShowForm(false);
        setMessage("");
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "Something went wrong while saving the book."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);

      const response = await fetch("/api/books", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: deleteId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to delete the book."
        );
      }

      setBooks((prev) =>
        prev.filter((book) => book.id !== deleteId)
      );

      setDeleteId(null);
      setMessage("Book deleted successfully.");

      setTimeout(() => {
        setMessage("");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "Something went wrong while deleting the book."
      );

      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredBooks = books.filter((book) => {
    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      !searchValue ||
      book.title.toLowerCase().includes(searchValue) ||
      book.author.toLowerCase().includes(searchValue) ||
      book.category.toLowerCase().includes(searchValue);

    const matchesCategory =
      categoryFilter === "All" ||
      book.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  /* =========================================================
     FORMAT
  ========================================================= */

  const formatPrice = (price: number) => {
    return `${price.toLocaleString("en-US")} DA`;
  };

  const getStockLabel = (stock: number) => {
    if (stock <= 0) {
      return "Out of Stock";
    }

    return `${stock} in stock`;
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#F8F4EC] px-3 py-4 text-[#071A33] sm:px-5 sm:py-6 lg:px-6">
      <div className="mx-auto max-w-[1400px]">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071A33] text-white shadow-sm">
              <Package size={21} />
            </div>

            <div>
              <h1 className="text-xl font-bold sm:text-2xl">
                Products
              </h1>

              <p className="text-xs text-slate-500 sm:text-sm">
                Manage your bookstore products
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="flex h-9 items-center justify-center gap-2 rounded-lg bg-[#071A33] px-4 text-xs font-semibold text-white transition hover:bg-[#10284a] sm:h-10 sm:text-sm"
          >
            <Plus size={17} />
            Add Book
          </button>
        </div>

        {/* =====================================================
            SUCCESS / ERROR MESSAGE
        ===================================================== */}

        {message && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700">
            <CheckCircle size={17} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <AlertTriangle size={17} />
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto rounded p-1 hover:bg-red-100"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* =====================================================
            SEARCH / FILTER
        ===================================================== */}

        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, author or category..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-[#071A33] outline-none transition focus:border-[#B8892D] focus:bg-white sm:h-10 sm:text-sm"
              />
            </div>

            <div className="relative md:w-56">
              <Tag
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value)
                }
                className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-[#071A33] outline-none transition focus:border-[#B8892D] focus:bg-white sm:h-10 sm:text-sm"
              >
                <option value="All">All Categories</option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.name}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-[#071A33]">
                {filteredBooks.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#071A33]">
                {books.length}
              </span>{" "}
              books
            </p>

            {categoryFilter !== "All" && (
              <button
                type="button"
                onClick={() => setCategoryFilter("All")}
                className="text-xs font-semibold text-[#B8892D] hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>

        {/* =====================================================
            FORM — SAME PAGE
            FORM IS ABOVE THE BOOK LIST
        ===================================================== */}

        {showForm && (
          <div
            ref={formRef}
            className="mb-6 scroll-mt-5 rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            {/* FORM HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
              <div>
                <h2 className="text-base font-bold text-[#071A33] sm:text-lg">
                  {editing ? "Edit Book" : "Add New Book"}
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {editing
                    ? "Update the information of this book."
                    : "Add a new book to your bookstore."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={submitting}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-[#071A33] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close form"
              >
                <X size={17} />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-4 sm:p-5"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

                {/* TITLE */}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#071A33]">
                    Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Book title"
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs outline-none transition focus:border-[#B8892D] focus:bg-white sm:h-10 sm:text-sm"
                  />
                </div>

                {/* AUTHOR */}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#071A33]">
                    Author
                  </label>

                  <input
                    type="text"
                    name="author"
                    value={form.author}
                    onChange={handleChange}
                    placeholder="Author name"
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs outline-none transition focus:border-[#B8892D] focus:bg-white sm:h-10 sm:text-sm"
                  />
                </div>

                {/* PRICE */}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#071A33]">
                    Price (DA)
                  </label>

                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0"
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs outline-none transition focus:border-[#B8892D] focus:bg-white sm:h-10 sm:text-sm"
                  />
                </div>

                {/* CATEGORY */}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#071A33]">
                    Category
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    disabled={categoriesLoading}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs outline-none transition focus:border-[#B8892D] focus:bg-white disabled:opacity-60 sm:h-10 sm:text-sm"
                  >
                    <option value="">
                      {categoriesLoading
                        ? "Loading categories..."
                        : "Select category"}
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.name}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* STOCK */}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#071A33]">
                    Stock
                  </label>

                  <input
                    type="number"
                    name="stock"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="0"
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs outline-none transition focus:border-[#B8892D] focus:bg-white sm:h-10 sm:text-sm"
                  />
                </div>

                {/* IMAGE */}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#071A33]">
                    Cover Image
                  </label>

                  <label className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 text-xs text-slate-500 transition hover:border-[#B8892D] hover:bg-white sm:h-10 sm:text-sm">
                    <Upload size={16} />

                    <span className="truncate">
                      {selectedImageName
                        ? selectedImageName
                        : typeof form.image === "string" &&
                            form.image
                          ? "Current image — choose new"
                          : "Choose JPG, PNG or WEBP"}
                    </span>

                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* DESCRIPTION */}

                <div className="md:col-span-2 lg:col-span-3">
                  <label className="mb-1.5 block text-xs font-semibold text-[#071A33]">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Book description..."
                    className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none transition focus:border-[#B8892D] focus:bg-white sm:text-sm"
                  />
                </div>
              </div>

              {/* FORM BUTTONS */}

              <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={submitting}
                  className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:h-10 sm:text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-9 items-center justify-center gap-2 rounded-lg bg-[#071A33] px-5 text-xs font-semibold text-white transition hover:bg-[#10284a] disabled:cursor-not-allowed disabled:opacity-60 sm:h-10 sm:text-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : editing ? (
                    <>
                      <CheckCircle size={16} />
                      Update Book
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Add Book
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =====================================================
            BOOK LIST
            ALWAYS VISIBLE
        ===================================================== */}

        <div>
          {loading ? (
            <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Loading books...
              </div>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <BookOpen size={22} />
              </div>

              <h3 className="text-sm font-bold text-[#071A33]">
                No books found
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                {search || categoryFilter !== "All"
                  ? "Try changing your search or category filter."
                  : "Start by adding your first book."}
              </p>

              {!search && categoryFilter === "All" && (
                <button
                  type="button"
                  onClick={openAddForm}
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-[#071A33] px-4 text-xs font-semibold text-white transition hover:bg-[#10284a]"
                >
                  <Plus size={15} />
                  Add Book
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* IMAGE */}

                  <div className="relative flex h-48 items-center justify-center overflow-hidden bg-slate-100">
                    {book.image ? (
                      <img
                        src={
                          book.image.startsWith("/")
                            ? book.image
                            : `/books/${book.image}`
                        }
                        alt={book.title}
                        className="h-full w-full object-contain p-3"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove(
                            "hidden"
                          );
                        }}
                      />
                    ) : null}

                    <div
                      className={`absolute inset-0 flex items-center justify-center text-slate-400 ${
                        book.image ? "hidden" : ""
                      }`}
                    >
                      <div className="text-center">
                        <ImageIcon
                          size={30}
                          className="mx-auto mb-1"
                        />
                        <span className="text-[10px]">
                          No image
                        </span>
                      </div>
                    </div>

                    {/* CATEGORY */}

                    <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold text-[#071A33] shadow-sm">
                      {book.category || "Uncategorized"}
                    </span>

                    {/* STOCK */}

                    <span
                      className={`absolute right-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold shadow-sm ${
                        book.stock > 0
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {getStockLabel(book.stock)}
                    </span>
                  </div>

                  {/* CONTENT */}

                  <div className="p-3">
                    <h3
                      className="truncate text-sm font-bold text-[#071A33]"
                      title={book.title}
                    >
                      {book.title}
                    </h3>

                    <p
                      className="mt-0.5 truncate text-xs text-slate-500"
                      title={book.author}
                    >
                      by {book.author}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-[#B8892D]">
                        {formatPrice(book.price)}
                      </span>

                      <span className="text-[10px] text-slate-400">
                        Stock: {book.stock}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 min-h-[32px] text-[11px] leading-4 text-slate-500">
                      {book.description ||
                        "No description available."}
                    </p>

                    {/* ACTIONS */}

                    <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => openEditForm(book)}
                        className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-[#071A33] transition hover:border-[#B8892D] hover:bg-[#F8F4EC]"
                      >
                        <Pencil size={13} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteId(book.id)}
                        className="flex h-8 items-center justify-center gap-1.5 rounded-lg border border-red-100 px-3 text-[11px] font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =====================================================
            DELETE CONFIRMATION
        ===================================================== */}

        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
                <Trash2 size={20} />
              </div>

              <h3 className="mt-3 text-center text-base font-bold text-[#071A33]">
                Delete Book?
              </h3>

              <p className="mt-1 text-center text-xs leading-5 text-slate-500">
                This action cannot be undone. The book will be
                permanently removed.
              </p>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteId(null)}
                  disabled={deleting}
                  className="h-9 flex-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  {deleting ? (
                    <>
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}