import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { prisma } from "./prisma";

/**
 * Auth.js v5 (next-auth@beta) with the Google provider.
 *
 * Session strategy is JWT so we don't need NextAuth's own Account/Session
 * tables — keeps the schema lean. The trade-off is no automatic
 * cross-device sign-out, but the audience is small and personal.
 *
 * The signIn callback upserts a DevpulseUser row keyed by email — that
 * lets the rest of the app (settings, saved, dismissed) treat email as
 * the stable identity without depending on Google's OAuth provider id.
 *
 * The jwt + session callbacks stitch the DevpulseUser.id into the session
 * so server components can do `await auth()` and read `session.user.id`
 * directly without an extra DB hop.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  pages: {
    // Default Auth.js error page is fine for now; revisit if abuse signals
    // suggest custom error UX is worth the effort.
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const existing = await prisma.devpulseUser.findUnique({
        where: { email: user.email },
        select: { id: true, name: true, image: true },
      });
      if (!existing) {
        await prisma.devpulseUser.create({
          data: {
            email: user.email,
            name: user.name ?? null,
            image: user.image ?? null,
          },
        });
        return true;
      }
      // Refresh name/image if Google's copy changed — cheap and keeps the
      // header avatar current without explicit profile syncs.
      if (existing.name !== user.name || existing.image !== user.image) {
        await prisma.devpulseUser.update({
          where: { email: user.email },
          data: { name: user.name ?? null, image: user.image ?? null },
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      // user is only present on the first jwt() call after sign-in. After
      // that the token survives across requests until expiration.
      if (user?.email && !token.devpulseId) {
        const row = await prisma.devpulseUser.findUnique({
          where: { email: user.email },
          select: { id: true },
        });
        if (row) token.devpulseId = row.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.devpulseId === "string") {
        session.user.id = token.devpulseId;
      }
      return session;
    },
  },
});
