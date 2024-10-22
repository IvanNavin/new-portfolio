import prisma from '@src/lib/prisma';
import { AnyType } from '@src/types';
import { OAuth2Client } from 'google-auth-library';
import { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const googleAuthClient = new OAuth2Client(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
);

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      type: 'credentials',
      id: 'google',
      name: 'Ivan Holovko Developer Auth',
      credentials: {
        credential: { type: 'text' },
      },
      authorize: async (credentials) => {
        const token = credentials?.credential;

        if (!token) {
          return null;
        }

        try {
          const ticket = (await googleAuthClient.verifyIdToken({
            idToken: token,
            audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          })) as AnyType;

          const payload = ticket?.getPayload();

          if (!payload) {
            return null;
          }

          const { email, name, picture: image } = payload;

          const user = await prisma.user.findUnique({
            where: { email: email },
          });

          if (!user) {
            await prisma.user.create({
              data: { email, name, cards: { create: [] } },
            });
          }

          return { email, name, image } as User;
        } catch (error) {
          console.error('Error during Google auth:', error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
};
