
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type CartItem = {
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

  
  // Load cart from localStorage
useEffect(() => {
  const storedUser = localStorage.getItem("currentUser");

  // Visitor: start with an empty cart after refresh
  if (!storedUser) {
    localStorage.removeItem("cart");
    setCart([]);
    setIsLoaded(true);
    return;
  }

  // Logged-in user: restore the cart
  const storedCart = localStorage.getItem("cart");

  if (storedCart) {
    setCart(JSON.parse(storedCart));
  }

  setIsLoaded(true);
}, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart, isLoaded]);

  const addToCart = (
    book: Omit<CartItem, "quantity">
  ) => {
    setCart((currentCart) => {
      const existingBook = currentCart.find(
        (item) => item.title === book.title
      );

      if (existingBook) {
        return currentCart.map((item) =>
          item.title === book.title
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

