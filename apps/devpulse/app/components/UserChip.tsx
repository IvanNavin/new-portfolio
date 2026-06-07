import { auth, signOut } from "@lib/auth";
import Link from "next/link";

import { Tooltip } from "./Tooltip";

/**
 * Compact avatar + auth controls for the header. Layout adapts:
 * - On md+ screens: avatar · name · separate sign-out text link
 * - On small screens: avatar-only link to /settings, sign-out becomes
 *   a tiny ⏻ icon button. Saves precious horizontal space in the
 *   already-busy header row.
 */
export async function UserChip() {
  const session = await auth();
  if (!session?.user) return null;

  const { name, email, image } = session.user;
  const displayName = name ?? email;
  return (
    <div className="flex items-center gap-2">
      <Tooltip label={`Signed in as ${email}. Open settings.`} side="bottom">
        <Link
          href="/settings"
          prefetch={false}
          aria-label={`Settings (signed in as ${email})`}
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
          <span className="hidden max-w-[120px] truncate sm:inline">
            {displayName}
          </span>
        </Link>
      </Tooltip>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <Tooltip label="Sign out" side="bottom">
          <button
            type="submit"
            aria-label="Sign out"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-dim)] hover:border-red-400/40 hover:text-red-200 focus-visible:ring-2 focus-visible:ring-red-400/50 focus-visible:outline-none sm:h-auto sm:w-auto sm:border-0 sm:px-1 sm:text-xs sm:normal-case sm:tracking-normal sm:hover:underline sm:underline-offset-4"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="sm:hidden"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="hidden sm:inline">sign out</span>
          </button>
        </Tooltip>
      </form>
    </div>
  );
}
