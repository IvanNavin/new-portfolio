"use client";

import { adminLogout } from "@/app/actions/admin-auth";
import { useAdmin } from "@/components/admin/AdminProvider";

export function AdminIndicator() {
  const { isAdmin, setIsAdmin } = useAdmin();
  if (!isAdmin) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        await adminLogout();
        setIsAdmin(false);
      }}
      title="Вийти з режиму адміна"
      className="flex items-center gap-1.5 rounded-full border border-accent bg-accent-soft px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wide text-accent-deep transition-colors hover:bg-accent hover:text-[color:var(--color-on-accent)]"
    >
      Адмін ✕
    </button>
  );
}
