"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Never show the client navbar inside admin pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return <Navbar />;
}
