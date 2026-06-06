import Link from "next/link";

import { auth, signIn, signOut } from "@lib/auth";

/**
 * Server-rendered auth chip in the header. When signed in, shows the
 * user's avatar + name and a "sign out" link. When signed out, a "Sign in
 * with Google" button. Both buttons go through Auth.js server actions so
 * no client-side state is needed.
 *
 * Keep the UI small — it lives in the header next to the live-feed pill
 * and shouldn't compete with the main content.
 */
export async function AuthButton() {
  const session = await auth();

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/settings"
          prefetch={false}
          className="flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2 py-1 text-xs normal-case tracking-normal text-[var(--text-dim)] hover:border-sky-400/40 hover:text-sky-200"
        >
          {session.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt=""
              width={18}
              height={18}
              className="h-[18px] w-[18px] rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : null}
          <span>{session.user.name ?? session.user.email}</span>
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="rounded-md border border-[var(--border)] px-2 py-1 text-xs normal-case tracking-normal text-[var(--text-dim)] hover:border-red-400/40 hover:text-red-200"
          >
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/" });
      }}
    >
      <button
        type="submit"
        className="rounded-md border border-sky-400/40 bg-sky-400/10 px-3 py-1 text-xs normal-case tracking-normal text-sky-100 hover:bg-sky-400/20"
      >
        Sign in with Google
      </button>
    </form>
  );
}
