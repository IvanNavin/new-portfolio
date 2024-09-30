import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { name, message } = await req.json();

  if (!name.trim()) {
    return NextResponse.json(
      { error: 'Name is required field' },
      { status: 400 },
    );
  }

  if (!message) {
    return NextResponse.json(
      { error: 'Message is required field' },
      { status: 400 },
    );
  }

  const token = process.env.NEXT_PUBLIC_TG_TOKEN;
  const chatId = process.env.NEXT_PUBLIC_TG_CHAT_ID;
  const text = `Повідомленя прислав ${name}: Повідомленя: ${message}`;
  const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${text}`;

  const res = await fetch(url);

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
