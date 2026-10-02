"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type CartItem = {
  id: string;
  title: string;
  author: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (book: Omit<CartItem, "quantity">) => void;
  removeFromCart: (title: string) => void;
  increaseQuantity: (title: string) => void;
  decreaseQuantity: (title: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const previousUser = useRef<string | null>(null);

  // Load cart when the application starts
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    let currentUser: string | null = null;

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        currentUser = user.email?.trim().toLowerCase() || null;
      } catch {
        currentUser = null;
      }
    }

    previousUser.current = currentUser;

    const navigationEntry = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming | undefined;

    const isPageRefresh = navigationEntry?.type === "reload";

    // Visitor + page refresh:
    // start with an empty cart.
    if (!currentUser && isPageRefresh) {
      localStorage.removeItem("cart");
      setCart([]);
      setIsLoaded(true);
      return;
    }

    // Otherwise restore the cart.
    const storedCart = localStorage.getItem("cart");

    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);

        // Keep only valid cart items.
        const validCart = Array.isArray(parsedCart)
          ? parsedCart.filter(
              (item) =>
                item &&
                typeof item.id === "string" &&
                typeof item.title === "string" &&
                typeof item.quantity === "number"
            )
          : [];

        setCart(validCart);
      } catch {
        localStorage.removeItem("cart");
        setCart([]);
      }
    }

    setIsLoaded(true);
  }, []);

  // Detect login/logout changes
  useEffect(() => {
    if (!isLoaded) return;

    const checkUser = () => {
      const storedUser = localStorage.getItem("currentUser");

      let currentUser: string | null = null;

      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          currentUser = user.email?.trim().toLowerCase() || null;
        } catch {
          currentUser = null;
        }
      }

      // User signed out
      if (previousUser.current && !currentUser) {
        setCart([]);
        localStorage.removeItem("cart");
      }

      previousUser.current = currentUser;
    };

    checkUser();

    const interval = setInterval(checkUser, 500);

    return () => clearInterval(interval);
  }, [isLoaded]);

  // Save cart
  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart, isLoaded]);

  const addToCart = (
    book: Omit<CartItem, "quantity">
  ) => {
    setCart((currentCart) => {
      const existingBook = currentCart.find(
        (item) => item.id === book.id
      );

      if (existingBook) {
        return currentCart.map((item) =>
          item.id === book.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...book,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (title: string) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.title !== title
      )
    );
  };

  const increaseQuantity = (title: string) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.title === title
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (title: string) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.title === title
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}