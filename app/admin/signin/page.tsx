"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";

function AdminSignInForm() {
const { login } = useAuth();
const router = useRouter();
const searchParams = useSearchParams();

const redirect = searchParams.get("redirect") || "/admin/dashboard";

const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const handleSubmit = async (event: React.FormEvent) => {
event.preventDefault();


setError("");
setLoading(true);

try {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
      action: "admin-login",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    setError(data.error || "Unable to sign in.");
    return;
  }

  // Only administrator accounts can use this page.
  if (data.user.role !== "admin") {
    setError(
      "This account is not an administrator account."
    );
    return;
  }

  // Save admin session.
  login({
    firstName: data.user.firstName,
    lastName: data.user.lastName,
    name: data.user.name,
    email: data.user.email,
    username: data.user.username,
    role: data.user.role,
  });

  router.push(redirect);
} catch (error) {
  console.error("Admin sign in error:", error);

  setError(
    "Unable to connect to the server."
  );
} finally {
  setLoading(false);
}


};

return ( <main className="min-h-screen bg-[#F8F4EC] px-6 py-8"> <div className="mx-auto max-w-md">


    {/* Header */}
    <div className="mb-5 text-center">
      <div className="mb-2 text-4xl">
        🔐
      </div>

      <h1 className="text-3xl font-bold text-[#071A33]">
        Admin Sign In
      </h1>

      <p className="mt-2 text-sm text-gray-600">
        Sign in to access the BookStore administration panel
      </p>
    </div>

    {/* Form */}
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="mb-1.5 block text-sm font-semibold text-[#071A33]"
          >
            Username
          </label>

          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
            placeholder="Enter admin username"
            required
            disabled={loading}
            autoComplete="username"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20 disabled:bg-gray-100"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-semibold text-[#071A33]"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter admin password"
              required
              disabled={loading}
              autoComplete="current-password"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20 disabled:bg-gray-100"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              disabled={loading}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-[#071A33] disabled:cursor-not-allowed"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#E8B04A] px-6 py-3 text-sm font-semibold text-[#071A33] transition hover:bg-[#F3C866] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Signing In..."
            : "Admin Sign In"}
        </button>
      </form>

      {/* Client Login */}
      <div className="mt-5 border-t border-gray-100 pt-4 text-center">
        <p className="text-xs text-gray-500">
          Are you a customer?
        </p>

        <Link
          href="/signin"
          className="mt-1 inline-block text-sm font-semibold text-[#071A33] hover:text-[#B8892D] hover:underline"
        >
          Customer Sign In
        </Link>
      </div>
    </div>
  </div>
</main>


);
}

export default function AdminSignIn() {
return (
<Suspense
fallback={ <main className="min-h-screen bg-[#F8F4EC] px-6 py-8"> <div className="mx-auto max-w-md text-center"> <p className="text-sm text-gray-600">
Loading... </p> </div> </main>
}
> <AdminSignInForm /> </Suspense>
);
}
