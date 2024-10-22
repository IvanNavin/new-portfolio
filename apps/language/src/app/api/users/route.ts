import { log } from '@repo/utils';
import prisma from '@src/lib/prisma';

export async function POST(req: Request) {
  const { email, name } = await req.json();

  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
      },
    });

    return new Response(JSON.stringify(newUser), {
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
