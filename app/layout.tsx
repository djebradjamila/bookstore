import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { WishlistProvider } from "@/components/WishlistContext";

export const metadata: Metadata = {
  title: "BookStore",
  description: "Discover and buy your favorite books online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
     <body className="bg-[#F8F4EC] text-[#071A33]">
  <WishlistProvider>
    <Navbar />
    {children}
  </WishlistProvider>
</body>
    </html>
  );
}