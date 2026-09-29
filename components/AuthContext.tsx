
"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);

      // Compatibility with existing accounts
      const nameParts = parsedUser.name?.trim().split(/\s+/) || [];

      const firstName =
        parsedUser.firstName || nameParts[0] || "";

      const lastName =
        parsedUser.lastName ||
        nameParts.slice(1).join(" ") ||
        "";

      setUser({
        firstName,
        lastName,
        name: parsedUser.name || `${firstName} ${lastName}`.trim(),
        email: parsedUser.email,
      });
    }
  }, []);

  const login = (user: User) => {
    localStorage.setItem("currentUser", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

