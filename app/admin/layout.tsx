
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Tags,
  Users,
  ShoppingCart,
  LogOut,
} from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    logout,
  } = useAuth();

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // The admin sign-in page is public.
    if (pathname === "/admin/signin") {
      return;
    }

    // IMPORTANT:
    // Do not redirect while AuthContext is restoring
    // the session from localStorage.
    if (isLoading) {
      return;
    }

    // After loading, check authentication.
    if (!isAuthenticated) {
      router.replace("/admin/signin");
      return;
    }

    // Authenticated user but not an administrator.
    if (!isAdmin) {
      router.replace("/admin/signin");
    }
  }, [
    pathname,
    isAuthenticated,
    isAdmin,
    isLoading,
    router,
  ]);

  // Admin sign-in page has no sidebar.
  if (pathname === "/admin/signin") {
    return <>{children}</>;
  }

  // Wait until AuthContext restores the session.
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F4EC]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#E8B04A] border-t-transparent" />

          <p className="text-sm text-[#071A33]">
            Loading admin panel...
          </p>
        </div>
      </div>
    );
  }

  // If authentication failed or the user is not an admin,
  // the useEffect above will redirect.
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: BookOpen,
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: Tags,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
  ];

  const handleSignOut = () => {
    logout();
    router.replace("/admin/signin");
  };

  return (
    <div className="min-h-screen bg-[#F8F4EC] text-[#071A33]">
      <div className="flex min-h-screen">

        {/* Admin Sidebar */}
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-[#071A33] text-white">

          {/* Logo */}
          <div className="border-b border-white/10 px-6 py-6">
            <h1 className="text-2xl font-bold text-[#E8B04A]">
              BookStore
            </h1>

            <p className="mt-1 text-sm text-gray-300">
              Admin Panel
            </p>
          </div>

          {/* Admin information */}
          <div className="px-4 pt-5">
            <div className="rounded-lg bg-white/10 px-4 py-3">
              <p className="text-xs text-gray-400">
                Signed in as
              </p>

              <p className="mt-1 truncate font-medium text-white">
                {user?.username ||
                  user?.name ||
                  user?.email ||
                  "Admin"}
              </p>

              <p className="mt-1 text-xs text-[#E8B04A]">
                Administrator
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-6">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                    isActive
                      ? "bg-[#E8B04A] font-medium text-[#071A33]"
                      : "text-gray-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={20} />

                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sign Out */}
          <div className="border-t border-white/10 p-4">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
            >
              <LogOut size={20} />

              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Admin Content */}
        <main className="ml-64 min-h-screen flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

