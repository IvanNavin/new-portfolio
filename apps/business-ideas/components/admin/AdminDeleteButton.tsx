"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteBusiness } from "@/app/actions/admin-content";
import { useAdmin } from "@/components/admin/AdminProvider";

interface AdminDeleteButtonProps {
  slug: string;
  name: string;
  /** Куди перейти після видалення; без нього — оновити поточну сторінку */
  redirectTo?: string;
}

export function AdminDeleteButton({
  slug,
  name,
  redirectTo,
}: AdminDeleteButtonProps) {
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  if (!isAdmin) return null;

  const onDelete = async () => {
    if (!window.confirm(`Видалити «${name}»? Дію не можна скасувати.`)) return;
    setPending(true);
    try {
      await deleteBusiness(slug);
    } finally {
      setPending(false);
    }
    if (redirectTo) router.push(redirectTo);
    else router.refresh();
  };

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      aria-label={`Видалити ${name}`}
      title="Видалити"
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-faint transition-colors hover:border-loss hover:text-loss disabled:opacity-50"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
      </svg>
    </button>
  );
}
