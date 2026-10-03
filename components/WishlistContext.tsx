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

const WishlistContext = createContext<
  WishlistContextType | undefined
>(undefined);

const VISITOR_ID_KEY = "visitorWishlistId";

function getVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);

  if (!visitorId) {
    visitorId = `visitor-${crypto.randomUUID()}`;
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }

  return visitorId;
}

export function WishlistProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<
    string | null
  >(null);

  const previousUserEmail = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // =====================================================
  // LOAD WISHLIST
  // =====================================================

  useEffect(() => {
    const loadWishlist = async () => {
      const storedUser = localStorage.getItem("currentUser");

      let email: string | null = null;

      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);

          email =
            user.email?.trim().toLowerCase() || null;
        } catch {
          email = null;
        }
      }

      // No user change
      if (
        email === previousUserEmail.current &&
        isLoaded
      ) {
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
        const navigationEntry =
          performance.getEntriesByType("navigation")[0] as
            | PerformanceNavigationTiming
            | undefined;

        const isPageRefresh =
          navigationEntry?.type === "reload";

        // Keep the original behavior:
        // visitor wishlist is cleared after refresh.
        if (isPageRefresh) {
          localStorage.removeItem("wishlist");

          setWishlist([]);
          setCurrentUserEmail(null);

          setIsLoaded(true);

          return;
        }

        const storedWishlist =
          localStorage.getItem("wishlist");

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
      // CONNECTED USER
      // =====================================================

      let visitorWishlist: string[] = [];

      const storedWishlist =
        localStorage.getItem("wishlist");

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
        // Load user's database wishlist
        const response = await fetch(
          `/api/wishlist?userEmail=${encodeURIComponent(
            email
          )}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
              "Unable to load wishlist."
          );
        }

        const databaseWishlist: string[] =
          data.wishlist.map(
            (item: { bookTitle: string }) =>
              item.bookTitle
          );

        // Merge visitor wishlist with user's wishlist
        const mergedWishlist = Array.from(
          new Set([
            ...databaseWishlist,
            ...visitorWishlist,
          ])
        );

        // =================================================
        // TRANSFER VISITOR WISHLIST TO USER ACCOUNT
        // =================================================

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

        // Visitor local wishlist has now been transferred
        localStorage.removeItem("wishlist");
      } catch (error) {
        console.error(
          "Failed to load wishlist:",
          error
        );

        // Keep visitor wishlist locally if API fails
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
  // SAVE VISITOR WISHLIST LOCALLY
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

    // Update UI immediately
    setWishlist(updatedWishlist);

    // =====================================================
    // VISITOR
    // =====================================================

    if (!currentUserEmail) {
      localStorage.setItem(
        "wishlist",
        JSON.stringify(updatedWishlist)
      );

      try {
        const visitorId = getVisitorId();

        if (isCurrentlyWishlisted) {
          await fetch("/api/wishlist", {
            method: "DELETE",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              userEmail: visitorId,
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
              userEmail: visitorId,
              bookTitle,
            }),
          });
        }
      } catch (error) {
        console.error(
          "Visitor wishlist synchronization error:",
          error
        );
      }

      return;
    }

    // =====================================================
    // CONNECTED USER
    // =====================================================

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

  // =====================================================
  // CHECK WISHLIST
  // =====================================================

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