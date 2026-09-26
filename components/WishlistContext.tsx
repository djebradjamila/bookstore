"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

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
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const previousUserEmail = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Detect visitor or logged-in user
  useEffect(() => {
    const checkUser = async () => {
      const storedUser = localStorage.getItem("currentUser");

      let email: string | null = null;

      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          email = user.email?.trim().toLowerCase() || null;
        } catch {
          email = null;
        }
      }

      // No change
      if (email === previousUserEmail.current) {
        return;
      }

      previousUserEmail.current = email;
      setCurrentUserEmail(email);

      // VISITOR
      if (!email) {
        const storedWishlist = localStorage.getItem("wishlist");

        if (storedWishlist) {
          try {
            setWishlist(JSON.parse(storedWishlist));
          } catch {
            localStorage.removeItem("wishlist");
            setWishlist([]);
          }
        } else {
          setWishlist([]);
        }

        setIsLoaded(true);
        return;
      }

      // LOGGED-IN USER
      try {
        const response = await fetch(
          `/api/wishlist?userEmail=${encodeURIComponent(email)}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Unable to load wishlist.");
        }

        const databaseWishlist = data.wishlist.map(
          (item: { bookTitle: string }) => item.bookTitle
        );

        // Keep visitor's local wishlist
        const localWishlist: string[] = [];

        const storedWishlist = localStorage.getItem("wishlist");

        if (storedWishlist) {
          try {
            localWishlist.push(...JSON.parse(storedWishlist));
          } catch {
            localStorage.removeItem("wishlist");
          }
        }

        // Add local books to the user's DynamoDB wishlist
        const mergedWishlist = Array.from(
          new Set([...databaseWishlist, ...localWishlist])
        );

        for (const bookTitle of mergedWishlist) {
          if (!databaseWishlist.includes(bookTitle)) {
            await fetch("/api/wishlist", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userEmail: email,
                bookTitle,
              }),
            });
          }
        }

        setWishlist(mergedWishlist);

        localStorage.setItem(
          "wishlist",
          JSON.stringify(mergedWishlist)
        );
      } catch (error) {
        console.error("Failed to load wishlist:", error);
      }

      setIsLoaded(true);
    };

    checkUser();

    // Detect login/logout in the same browser tab
    const interval = setInterval(checkUser, 500);

    return () => clearInterval(interval);
  }, []);

  // Save visitor wishlist locally
  useEffect(() => {
    if (!isLoaded) return;

    if (!currentUserEmail) {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, currentUserEmail, isLoaded]);

  const toggleWishlist = async (bookTitle: string) => {
    const isCurrentlyWishlisted = wishlist.includes(bookTitle);

    // Update interface immediately
    setWishlist((currentWishlist) =>
      isCurrentlyWishlisted
        ? currentWishlist.filter((title) => title !== bookTitle)
        : [...currentWishlist, bookTitle]
    );

    // Visitor → localStorage
    if (!currentUserEmail) {
      return;
    }

    // Client → DynamoDB
    try {
      if (isCurrentlyWishlisted) {
        await fetch("/api/wishlist", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userEmail: currentUserEmail,
            bookTitle,
          }),
        });
      } else {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userEmail: currentUserEmail,
            bookTitle,
          }),
        });
      }
    } catch (error) {
      console.error("Wishlist synchronization error:", error);
    }
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