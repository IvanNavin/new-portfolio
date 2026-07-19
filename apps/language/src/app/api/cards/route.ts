import prisma from '@root/src/lib/prisma';
import { authConfig } from '@src/lib/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// The caller's DB user from the session, or null. Every op is scoped to this
// user — the client can no longer name whose cards it reads/mutates.
async function getSessionUser() {
  const session = await getServerSession(authConfig);
  const email = session?.user?.email;
  if (!email) return null;
  return prisma.user.findUnique({ where: { email } });
}

const unauthorized = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const userCards = await prisma.card.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(userCards, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const body = await request.json();
  const { word, translation } = body;

  if (!word || !translation) {
    return NextResponse.json(
      { error: 'word and translation are required' },
      { status: 400 },
    );
  }

  try {
    const newCard = await prisma.card.create({
      data: {
        userId: user.id,
        word,
        translation,
        remembered: false,
      },
    });

    return NextResponse.json(newCard, { status: 201 });
  } catch (error) {
    console.error('Failed to create card:', error);
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const body = await request.json();
  const { id, word, translation, remembered } = body;

  if (!id) {
    return NextResponse.json({ error: 'Card id is required' }, { status: 400 });
  }

  try {
    // Ownership check; 404 for both missing and not-yours to avoid leaking ids.
    const existing = await prisma.card.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const updatedCard = await prisma.card.update({
      where: { id },
      data: {
        word,
        translation,
        remembered,
      },
    });

    return NextResponse.json(updatedCard, { status: 200 });
  } catch (error) {
    console.error('Failed to update card:', error);
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const cardId = searchParams.get('cardId');

  if (!cardId) {
    return NextResponse.json({ error: 'cardId is required' }, { status: 400 });
  }

  try {
    // deleteMany scoped to the caller — affects 0 rows if the card isn't theirs.
    const result = await prisma.card.deleteMany({
      where: { id: cardId, userId: user.id },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Card deleted successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Failed to delete card:', error);
    return NextResponse.json(
      { error: 'Failed to delete card' },
      { status: 500 },
    );
  }
}
