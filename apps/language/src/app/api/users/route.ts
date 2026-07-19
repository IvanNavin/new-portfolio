import { log } from '@repo/utils';
import prisma from '@src/lib/prisma';
import { authConfig } from '@src/lib/auth';
import { getServerSession } from 'next-auth';

// Users are created by the Google sign-in flow; this is only a safety net. It
// requires a session and can only create the caller's own row (was open to
// anyone mass-creating arbitrary users).
export async function POST(req: Request) {
  const session = await getServerSession(authConfig);
  const sessionEmail = session?.user?.email;

  if (!sessionEmail) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { name } = await req.json();

  try {
    // Idempotent upsert keyed on the authenticated email.
    const user = await prisma.user.upsert({
      where: { email: sessionEmail },
      update: {},
      create: { email: sessionEmail, name },
    });

    return new Response(JSON.stringify(user), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    log(error);
    return new Response(JSON.stringify({ error: 'Failed to create user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
