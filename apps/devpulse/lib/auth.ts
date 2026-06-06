import { OAuth2Client } from "google-auth-library";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { prisma } from "./prisma";

/**
 * Auth.js v5 with a Credentials provider that accepts a Google ID token
 * from the Google One Tap flow on the client. No redirect dance, no
 * "Sign in" button — the GSI script shows a card to unauthenticated
 * users, the client POSTs the returned credential here, we verify the
 * signature, upsert the DevpulseUser, and issue a JWT session.
 *
 * Mirrors the pattern from apps/language. Same Google project, same
 * client ID, no client secret needed (token verification is signature-
 * based via Google's public keys).
 *
 * Required env:
 *   NEXT_PUBLIC_GOOGLE_CLIENT_ID — exposed to the client for GSI init;
 *     also read here to set the expected audience for verifyIdToken.
 *   AUTH_SECRET                  — JWT session signing/encryption.
 */
const CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID ?? "";

const googleClient = new OAuth2Client(CLIENT_ID);

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
  providers: [
    Credentials({
      id: "google-one-tap",
      name: "Google One Tap",
      credentials: {
        credential: { type: "text" },
      },
      async authorize(credentials) {
        const raw = credentials?.credential;
        if (typeof raw !== "string" || !raw) return null;
        try {
          const ticket = await googleClient.verifyIdToken({
            idToken: raw,
            audience: CLIENT_ID,
          });
          const payload = ticket.getPayload();
          if (!payload?.email) return null;
          const email = payload.email;
          const name = payload.name ?? null;
          const image = payload.picture ?? null;

          const existing = await prisma.devpulseUser.findUnique({
            where: { email },
            select: { id: true, name: true, image: true },
          });
          if (!existing) {
            await prisma.devpulseUser.create({
              data: { email, name, image },
            });
          } else if (existing.name !== name || existing.image !== image) {
            await prisma.devpulseUser.update({
              where: { email },
              data: { name, image },
            });
          }

          return { email, name, image };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      // user is only defined on the very first jwt() call after sign-in.
      // Stitch the DevpulseUser.id into the token so session() can copy it
      // back without an extra DB hop on every server-render.
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
