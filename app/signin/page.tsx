
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";

export default function SignIn() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const storedUser = localStorage.getItem(`user_${email}`);

     if (!storedUser) {
       setError("No account found with this email.");
       return;
      }

    const user = JSON.parse(storedUser);

     if (user.password !== password) {
       setError("Incorrect password.");
       return;
      }

     login({name: user.name,email: user.email,});

    setSuccess(`Welcome back, ${user.name}!`);

      setTimeout(() => {
       router.push("/");
      }, 800);
    };

   return (
    <main className="min-h-screen bg-[#F8F4EC] px-6 py-12">
      <div className="mx-auto max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 text-5xl">📖</div>

          <h1 className="text-4xl font-bold text-[#071A33]">
            Welcome Back
          </h1>

          <p className="mt-3 text-gray-600">
            Sign in to your BookStore account
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl bg-white p-8 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block font-semibold text-[#071A33]"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block font-semibold text-[#071A33]"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#071A33]"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Submit */}
            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
             </p>
            )}

            {success && (
              <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-600">
                {success}
               </p>
            )}
            <button
              type="submit"
              className="w-full rounded-full bg-[#E8B04A] px-6 py-3 font-semibold text-[#071A33] transition hover:bg-[#F3C866]"
            >
              Sign In
            </button>
          </form>

          {/* Sign Up */}
          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[#B8892D] hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

