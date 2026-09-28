
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
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(
    null
  );
  const previousUserEmail = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load wishlist and detect login/logout
  useEffect(() => {
    const loadWishlist = async () => {
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

      // No user change
      if (email === previousUserEmail.current && isLoaded) {
        return;
      }

      const oldEmail = previousUserEmail.current;
      previousUserEmail.current = email;

      // =====================================================
      // LOGOUT
      // =====================================================
      if (oldEmail && !email) {
        setCurrentUserEmail(null);
        setWishlist([]);
        localStorage.removeItem("wishlist");
        setIsLoaded(true);
        return;
      }

      // =====================================================
      // VISITOR
      // =====================================================
      if (!email) {
        const navigationEntry = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming | undefined;

        const isPageRefresh =
          navigationEntry?.type === "reload";

        // Visitor + refresh = clear wishlist
        if (isPageRefresh) {
          localStorage.removeItem("wishlist");
          setWishlist([]);
          setCurrentUserEmail(null);
          setIsLoaded(true);
          return;
        }

        // Visitor without refresh = restore temporary wishlist
        const storedWishlist = localStorage.getItem("wishlist");

        let visitorWishlist: string[] = [];

        if (storedWishlist) {
          try {
            const parsed = JSON.parse(storedWishlist);

            if (Array.isArray(parsed)) {
              visitorWishlist = parsed;
            }
          } catch {
            localStorage.removeItem("wishlist");
          }
        }

        setCurrentUserEmail(null);
        setWishlist(visitorWishlist);
        setIsLoaded(true);
        return;
      }

      // =====================================================
      // LOGIN
      // =====================================================

      // Keep the visitor wishlist before login.
      let visitorWishlist: string[] = [];

      const storedWishlist = localStorage.getItem("wishlist");

      if (storedWishlist) {
        try {
          const parsed = JSON.parse(storedWishlist);

          if (Array.isArray(parsed)) {
            visitorWishlist = parsed;
          }
        } catch {
          localStorage.removeItem("wishlist");
        }
      }

      setCurrentUserEmail(email);

      try {
        // Load wishlist belonging to the connected account
        const response = await fetch(
          `/api/wishlist?userEmail=${encodeURIComponent(email)}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Unable to load wishlist."
          );
        }

        const databaseWishlist: string[] = data.wishlist.map(
          (item: { bookTitle: string }) => item.bookTitle
        );

        // Merge visitor wishlist with account wishlist
        const mergedWishlist = Array.from(
          new Set([
            ...databaseWishlist,
            ...visitorWishlist,
          ])
        );

        // Save visitor wishlist items to the account
        for (const bookTitle of visitorWishlist) {
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

        // Visitor wishlist has now been transferred
        localStorage.removeItem("wishlist");
      } catch (error) {
        console.error(
          "Failed to load wishlist:",
          error
        );

        // If the database request fails, keep the
        // visitor wishlist temporarily.
        setWishlist(visitorWishlist);

        localStorage.setItem(
          "wishlist",
          JSON.stringify(visitorWishlist)
        );
      }

      setIsLoaded(true);
    };

    loadWishlist();

    const interval = setInterval(
      loadWishlist,
      500
    );

    return () => clearInterval(interval);
  }, [isLoaded]);

  // =====================================================
  // SAVE WISHLIST FOR VISITOR
  // =====================================================
  useEffect(() => {
    if (!isLoaded || currentUserEmail) {
      return;
    }

    localStorage.setItem(
      "wishlist",
      JSON.stringify(wishlist)
    );
  }, [
    wishlist,
    currentUserEmail,
    isLoaded,
  ]);

  // =====================================================
  // TOGGLE WISHLIST
  // =====================================================
  const toggleWishlist = async (
    bookTitle: string
  ) => {
    const isCurrentlyWishlisted =
      wishlist.includes(bookTitle);

    const updatedWishlist =
      isCurrentlyWishlisted
        ? wishlist.filter(
            (title) => title !== bookTitle
          )
        : [...wishlist, bookTitle];

    setWishlist(updatedWishlist);

    // Visitor
    if (!currentUserEmail) {
      localStorage.setItem(
        "wishlist",
        JSON.stringify(updatedWishlist)
      );

      return;
    }

    // Connected user
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
      console.error(
        "Wishlist synchronization error:",
        error
      );
    }
  };

  const isWishlisted = (
    bookTitle: string
  ) => {
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
  const context = useContext(
    WishlistContext
  );

  if (!context) {
    throw new Error(
      "useWishlist must be used inside WishlistProvider"
    );
  }

  return context;
}

