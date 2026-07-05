"use client";

import { useEffect, useState } from "react";

import { adminLogin } from "@/app/actions/admin-auth";
import { useAdmin } from "@/components/admin/AdminProvider";

/** Модалка входу: зʼявляється на ?admin=true, ставить режим адміна. */
export function AdminGate() {
  const { isAdmin, setIsAdmin } = useAdmin();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "true" && !isAdmin) setOpen(true);
  }, [isAdmin]);

  const cleanUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("admin");
    window.history.replaceState(null, "", url);
  };

  const close = () => {
    setOpen(false);
    setPassword("");
    setError(false);
    cleanUrl();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    const ok = await adminLogin(password);
    setPending(false);
    if (ok) {
      setIsAdmin(true);
      close();
    } else {
      setError(true);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-card p-6 shadow-hard">
        <h2 className="font-display text-lg font-bold">Режим адміністратора</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Введи пароль, щоб редагувати контент.
        </p>
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="Пароль"
            autoFocus
            className="w-full rounded-lg border border-line bg-inset px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
          />
          {error ? <p className="text-sm text-loss">Невірний пароль</p> : null}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-on-accent)] transition-colors hover:bg-accent-deep disabled:opacity-50"
            >
              {pending ? "…" : "Увійти"}
            </button>
            <button
              type="button"
              onClick={close}
              className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-ink-soft transition-colors hover:text-ink"
            >
              Скасувати
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
