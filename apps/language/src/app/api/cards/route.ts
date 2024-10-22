import prisma from '@root/src/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userEmail = searchParams.get('userEmail');

  if (!userEmail) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userCards = await prisma.card.findMany({
      where: {
        userId: user.id,
      },
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
  const body = await request.json();
  const { userEmail, word, translation } = body;

  if (!userEmail || !word || !translation) {
    return NextResponse.json(
      { error: 'userEmail, word, and translation are required' },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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
  const body = await request.json();
  const { id, word, translation, remembered } = body;

  if (!id) {
    return NextResponse.json({ error: 'Card id is required' }, { status: 400 });
  }

  try {
    const updatedCard = await prisma.card.update({
      where: {
        id,
      },
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
  const { searchParams } = new URL(request.url);
  const cardId = searchParams.get('cardId');

  if (!cardId) {
    return NextResponse.json({ error: 'cardId is required' }, { status: 400 });
  }

  try {
    await prisma.card.delete({
      where: {
        id: cardId,
      },
    });

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
