
"use client";

import { createContext, useContext, useState } from "react";

type WishlistContextType = {
  wishlist: string[];
  toggleWishlist: (bookTitle: string) => void;
  isWishlisted: (bookTitle: string) => boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [wishlist, setWishlist] = useState<string[]>([]);

  const toggleWishlist = (bookTitle: string) => {
    setWishlist((currentWishlist) =>
      currentWishlist.includes(bookTitle)
        ? currentWishlist.filter((title) => title !== bookTitle)
        : [...currentWishlist, bookTitle]
    );
  };

  const isWishlisted = (bookTitle: string) => {
    return wishlist.includes(bookTitle);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }

  return context;
}

