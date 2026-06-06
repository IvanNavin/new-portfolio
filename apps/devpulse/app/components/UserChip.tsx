import { auth, signOut } from "@lib/auth";
import Link from "next/link";

/**
 * Tiny avatar + name display in the header. Renders nothing when the
 * visitor is signed out (One Tap handles sign-in UX). When signed in,
 * the avatar links to /settings and a small "sign out" link hangs off
 * the side for parity.
 */
export async function UserChip() {
  const session = await auth();
  if (!session?.user) return null;

  const { name, email, image } = session.user;
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/settings"
        prefetch={false}
        title={email}
        className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2 py-1 text-xs normal-case tracking-normal text-[var(--text-dim)] hover:border-sky-400/40 hover:text-sky-200"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            width={18}
            height={18}
            className="h-[18px] w-[18px] rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : null}
        <span>{name ?? email}</span>
      </Link>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="text-xs normal-case tracking-normal text-[var(--text-dim)] underline-offset-4 hover:text-red-200 hover:underline"
          aria-label="Sign out"
        >
          sign out
        </button>
      </form>
    </div>
  );
}
