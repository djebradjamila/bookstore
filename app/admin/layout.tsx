
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Tags,
  Users,
  ShoppingCart,
  Heart,
  Mail,
  UserCircle,
  LogOut,
} from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthContext";

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
  {
    name: "Wishlist",
    href: "/admin/wishlist",
    icon: Heart,
  },
  {
    name: "Contact Messages",
    href: "/admin/contact",
    icon: Mail,
  },
];

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Admin Dashboard",
  "/admin/products": "Admin Products",
  "/admin/categories": "Admin Categories",
  "/admin/users": "Admin Users",
  "/admin/orders": "Admin Orders",
  "/admin/wishlist": "Admin Wishlist",
  "/admin/contact": "Admin Contact Messages",
  "/admin/profile": "Admin Profile",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const {
    isAuthenticated,
    isAdmin,
    isLoading,
    logout,
  } = useAuth();

  const pageTitle =
    pageTitles[pathname] || "Admin Dashboard";

  useEffect(() => {
    if (isLoading) return;

    if (pathname === "/admin/signin") {
      if (isAuthenticated && isAdmin) {
        router.replace("/admin/dashboard");
      }

      return;
    }

    if (!isAuthenticated || !isAdmin) {
      router.replace("/admin/signin");
    }
  }, [
    pathname,
    isAuthenticated,
    isAdmin,
    isLoading,
    router,
  ]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F4EC]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#E8B04A]" />

          <p className="mt-4 text-sm text-gray-500">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (pathname === "/admin/signin") {
    return <>{children}</>;
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.replace("/admin/signin");
  };

  return (
    <div className="min-h-screen bg-[#F8F4EC]">
      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <aside
        className="
          fixed
          left-0
          top-0
          z-40
          flex
          h-screen
          w-[72px]
          flex-col
          bg-[#071A33]
          text-white
          sm:w-64
        "
      >
        {/* ================================================= */}
        {/* LOGO / PAGE TITLE */}
        {/* ================================================= */}

        <div className="border-b border-white/10 px-2 py-5 sm:px-6 sm:py-6">
          <Link
            href="/admin/dashboard"
            className="flex items-center justify-center sm:block"
          >
            {/* Mobile */}
            <span className="text-xl font-bold text-[#E8B04A] sm:hidden">
              B
            </span>

            {/* Desktop */}
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold tracking-wide text-[#E8B04A]">
                BookStore
              </h1>

              <p className="mt-1 text-xs text-white/50">
                {pageTitle}
              </p>
            </div>
          </Link>
        </div>

        {/* ================================================= */}
        {/* ADMIN PROFILE */}
        {/* ================================================= */}

        <div className="border-b border-white/10 px-2 py-3 sm:px-4 sm:py-4">
          <Link
            href="/admin/profile"
            title="Admin Profile"
            className={`
              flex
              w-full
              items-center
              justify-center
              rounded-xl
              px-2
              py-3
              transition
              sm:justify-start
              sm:gap-3
              sm:px-4
              ${
                pathname === "/admin/profile" ||
                pathname.startsWith("/admin/profile/")
                  ? "bg-[#E8B04A] text-[#071A33]"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }
            `}
          >
            <UserCircle size={20} />

            <span className="hidden text-sm font-medium sm:inline">
              Admin Profile
            </span>
          </Link>
        </div>

        {/* ================================================= */}
        {/* NAVIGATION */}
        {/* ================================================= */}

        <nav
          className="
            overflow-y-auto
            px-2
            py-4
            sm:flex-1
            sm:px-4
            sm:py-5
          "
        >
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.name}
                  className={`
                    flex
                    items-center
                    justify-center
                    rounded-xl
                    px-2
                    py-3
                    transition
                    sm:justify-start
                    sm:gap-3
                    sm:px-4

                    ${
                      isActive
                        ? "bg-[#E8B04A] text-[#071A33]"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }
                  `}
                >
                  <Icon size={20} />

                  <span className="hidden text-sm font-medium sm:inline">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ================================================= */}
        {/* SIGN OUT */}
        {/* ================================================= */}

        <div className="border-t border-white/10 p-2 sm:p-4">
          <button
            type="button"
            onClick={handleLogout}
            title="Sign Out"
            className="
              flex
              w-full
              items-center
              justify-center
              rounded-xl
              px-2
              py-3
              text-red-300
              transition
              hover:bg-red-500/10
              hover:text-red-200
              sm:justify-start
              sm:gap-3
              sm:px-4
            "
          >
            <LogOut size={20} />

            <span className="hidden text-sm font-medium sm:inline">
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <main className="ml-[72px] min-h-screen sm:ml-64">
        {children}
      </main>
    </div>
  );
}

