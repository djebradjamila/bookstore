"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Shield,
  Lock,
  Pencil,
  Save,
  X,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

type AdminUser = {
  email: string;
  name: string;
  username: string;
  role: string;
};

export default function AdminProfilePage() {
  const [user, setUser] = useState<AdminUser | null>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // =========================================================
  // LOAD ADMIN PROFILE
  // =========================================================
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/profile", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load administrator profile."
          );
        }

        setUser(data.user);
        setName(data.user.name || "");
        setUsername(data.user.username || "");
      } catch (err) {
        console.error("Profile loading error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load administrator profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // =========================================================
  // START EDITING
  // =========================================================
  const handleEdit = () => {
    setSuccess("");
    setError("");
    setPassword("");
    setShowPassword(false);
    setEditing(true);
  };

  // =========================================================
  // CANCEL EDITING
  // =========================================================
  const handleCancel = () => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
    }

    setPassword("");
    setShowPassword(false);
    setError("");
    setSuccess("");
    setEditing(false);
  };

  // =========================================================
  // SAVE PROFILE
  // =========================================================
  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (password && password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update administrator profile."
        );
      }

      setUser(data.user);

      setName(data.user.name || "");
      setUsername(data.user.username || "");
      setPassword("");
      setShowPassword(false);

      setSuccess("Profile updated successfully.");
      setEditing(false);
    } catch (err) {
      console.error("Profile update error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update administrator profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading profile...
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#071A33]">
            Admin Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your administrator account information.
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E8B04A] px-5 py-2.5 text-sm font-semibold text-[#071A33] transition hover:bg-[#F3C866]"
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Messages */}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* Profile Card */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {/* Profile top */}
        <div className="border-b border-gray-100 bg-[#071A33] px-6 py-7 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8B04A] text-[#071A33]">
              <Shield className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                Administrator
              </h2>

              <p className="text-sm text-gray-300">
                Manage your administrator account
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSave}
          className="space-y-6 p-6 sm:p-8"
        >
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold text-[#071A33]"
            >
              Name
            </label>

            <div className="relative">
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={!editing || saving}
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm text-[#071A33] outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20 disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-semibold text-[#071A33]"
            >
              Username
            </label>

            <div className="relative">
              <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                disabled={!editing || saving}
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm text-[#071A33] outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20 disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-[#071A33]"
            >
              Email
            </label>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

              <input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                readOnly
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-sm text-gray-600 outline-none"
              />
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Administrator email cannot be changed.
            </p>
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="role"
              className="mb-2 block text-sm font-semibold text-[#071A33]"
            >
              Role
            </label>

            <div className="relative">
              <Shield className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

              <input
                id="role"
                type="text"
                value="Administrator"
                disabled
                readOnly
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-sm text-gray-600 outline-none"
              />
            </div>
          </div>

          {/* Password */}
          {editing && (
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[#071A33]"
              >
                New Password
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  disabled={saving}
                  placeholder="Leave empty to keep current password"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-12 text-sm text-[#071A33] outline-none transition focus:border-[#E8B04A] focus:ring-2 focus:ring-[#E8B04A]/20 disabled:bg-gray-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  disabled={saving}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-[#071A33] disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Leave this field empty if you do not want to
                change your password. Minimum 6 characters.
              </p>
            </div>
          )}

          {/* Buttons */}
          {editing && (
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-[#071A33] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E8B04A] px-5 py-2.5 text-sm font-semibold text-[#071A33] transition hover:bg-[#F3C866] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Security Information */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8B04A]/20 text-[#B8892D]">
            <Lock className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-semibold text-[#071A33]">
              Security
            </h3>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Your administrator password is securely hashed
              before it is stored. When changing your password,
              use at least 6 characters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}