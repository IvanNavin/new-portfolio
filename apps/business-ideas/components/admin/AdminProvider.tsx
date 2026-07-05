"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AdminContextValue {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}

const AdminContext = createContext<AdminContextValue>({
  isAdmin: false,
  setIsAdmin: () => {},
});

/**
 * Тримає прапорець «режим адміна» для клієнтських компонентів.
 * Стартує false (SSR), після маунту читає UI-cookie-підказку.
 */
export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const has = document.cookie
      .split(";")
      .some((c) => c.trim().startsWith("bi_admin_ui="));
    if (has) setIsAdmin(true);
  }, []);

  return (
    <AdminContext.Provider value={{ isAdmin, setIsAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
