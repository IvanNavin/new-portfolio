import { OAuth2Client } from 'google-auth-library';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { getPrisma, isDatabaseConfigured } from './prisma';

/**
 * Auth.js v5 with Google One Tap, copied from apps/devpulse: the client shows
 * the GSI card, POSTs the returned ID token here, and we verify its signature
 * against Google's public keys. No client secret and no redirect dance.
 *
 * Signing in is entirely optional — it only turns on cross-device progress
 * sync. With no env vars set the provider simply never authorises anyone and
 * the game keeps working from localStorage.
 *
 * Required env for sign-in:
 *   NEXT_PUBLIC_GOOGLE_CLIENT_ID — also the expected audience for the token
 *   AUTH_SECRET                  — JWT session signing
 *   POSTGRES_PRISMA_URL          — where progress is mirrored
 */
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

const googleClient = new OAuth2Client(CLIENT_ID);

declare module 'next-auth' {
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
      id: 'google-one-tap',
      name: 'Google One Tap',
      credentials: { credential: { type: 'text' } },
      async authorize(credentials) {
        const raw = credentials?.credential;
        if (typeof raw !== 'string' || !raw) return null;
        if (!CLIENT_ID || !isDatabaseConfigured()) return null;

        try {
          const ticket = await googleClient.verifyIdToken({
            idToken: raw,
            audience: CLIENT_ID,
          });
          const payload = ticket.getPayload();
          if (!payload?.email) return null;

          const { email } = payload;
          const name = payload.name ?? null;
          const image = payload.picture ?? null;
          const prisma = getPrisma();

          const existing = await prisma.devopsQuestUser.findUnique({
            where: { email },
            select: { id: true, name: true, image: true },
          });
          if (!existing) {
            await prisma.devopsQuestUser.create({
              data: { email, name, image },
            });
          } else if (existing.name !== name || existing.image !== image) {
            await prisma.devopsQuestUser.update({
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
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      // `user` is only set on the first call after sign-in; stitch the row id
      // onto the token so session() needs no DB hop per render.
      if (user?.email && !token.questUserId) {
        const row = await getPrisma().devopsQuestUser.findUnique({
          where: { email: user.email },
          select: { id: true },
        });
        if (row) token.questUserId = row.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.questUserId === 'string') {
        session.user.id = token.questUserId;
      }
      return session;
    },
  },
});
