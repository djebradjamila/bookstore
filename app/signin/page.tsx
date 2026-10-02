"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";

function SignInForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          action: "login",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Unable to sign in."
        );
        return;
      }

      // Admin accounts must use the admin login page.
      if (data.user.role === "admin") {
        setError(
          "Please use the Admin Sign In page to access the admin panel."
        );
        return;
      }

      // Save normal user session.
      login({
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      });

      setSuccess(
        `Welcome back, ${data.user.name}!`
      );

      router.push(redirect);
    } catch (error) {
      console.error(
        "Sign in error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F4EC] px-6 py-8">
      <div className="mx-auto max-w-md">

        {/* Header */}
        <div className="mb-5 text-center">
          <div className="mb-2 text-4xl">
            📖
          </div>

          <h1 className="text-3xl font-bold text-[#071A33]">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Sign in to your BookStore account
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-semibold text-[#071A33]"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
                required
                disabled={loading}
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
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20 disabled:bg-gray-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-[#071A33] disabled:cursor-not-allowed"
                >
                  {showPassword
                    ? "🙈"
                    : "👁️"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            {/* Success */}
            {success && (
              <p className="rounded-xl bg-green-50 px-4 py-2.5 text-sm font-medium text-green-600">
                {success}
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
                : "Sign In"}
            </button>
          </form>

          {/* Sign Up */}
          <p className="mt-5 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[#B8892D] hover:underline"
            >
              Create an account
            </Link>
          </p>

          {/* Admin Login */}
          <div className="mt-4 border-t border-gray-100 pt-4 text-center">
            <p className="text-xs text-gray-500">
              Are you an administrator?
            </p>

            <Link
              href="/admin/signin"
              className="mt-1 inline-block text-sm font-semibold text-[#071A33] hover:text-[#B8892D] hover:underline"
            >
              Admin Sign In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SignIn() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F8F4EC] px-6 py-8">
          <div className="mx-auto max-w-md text-center">
            <p className="text-sm text-gray-600">
              Loading...
            </p>
          </div>
        </main>
      }
    >
      <SignInForm />
    </Suspense>
  );
}