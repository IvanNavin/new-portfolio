import { authConfig } from '@src/lib/auth';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET() {
  const session = await getServerSession(authConfig);

  if (session) {
    return NextResponse.json({ isLoggedIn: true, user: session.user });
  } else {
    return NextResponse.json({ isLoggedIn: false });
  }
}
