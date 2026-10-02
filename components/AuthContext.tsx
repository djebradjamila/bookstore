
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type User = {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  username?: string;
  role: "user" | "admin";
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
};

const AuthContext =
  createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("currentUser");

      console.log("AUTH: stored currentUser =", storedUser);

      if (!storedUser) {
        setUser(null);
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      console.log("AUTH: parsed user =", parsedUser);
      console.log("AUTH: role =", parsedUser.role);

      const nameParts =
        typeof parsedUser.name === "string"
          ? parsedUser.name.trim().split(/\s+/)
          : [];

      const firstName =
        parsedUser.firstName ||
        nameParts[0] ||
        "";

      const lastName =
        parsedUser.lastName ||
        nameParts.slice(1).join(" ") ||
        "";

      const restoredUser: User = {
        firstName,
        lastName,
        name:
          parsedUser.name ||
          `${firstName} ${lastName}`.trim(),
        email: parsedUser.email || "",
        username: parsedUser.username,
        role:
          parsedUser.role === "admin"
            ? "admin"
            : "user",
      };

      console.log(
        "AUTH: restored user =",
        restoredUser
      );

      setUser(restoredUser);
    } catch (error) {
      console.error(
        "AUTH: failed to restore session:",
        error
      );

      localStorage.removeItem("currentUser");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (user: User) => {
    const normalizedUser: User = {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      name:
        user.name ||
        `${user.firstName || ""} ${
          user.lastName || ""
        }`.trim(),
      email: user.email || "",
      username: user.username,
      role:
        user.role === "admin"
          ? "admin"
          : "user",
    };

    console.log(
      "AUTH: login user =",
      normalizedUser
    );

    localStorage.setItem(
      "currentUser",
      JSON.stringify(normalizedUser)
    );

    setUser(normalizedUser);
    setIsLoading(false);
  };

  const logout = () => {
    console.log("AUTH: logout");

    localStorage.removeItem("currentUser");
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
