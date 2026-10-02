import type { Metadata } from "next";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import { WishlistProvider } from "@/components/WishlistContext";
import { CartProvider } from "@/components/CartContext";
import { AuthProvider } from "@/components/AuthContext";

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
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <ConditionalNavbar />
              {children}
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}