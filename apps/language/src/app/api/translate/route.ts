import { AnyType } from '@src/types';
import translate from 'google-translate-api-x';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { word, from = 'en', to = 'ru' } = await request.json();

  try {
    const result = await translate(word, { from, to });
    return NextResponse.json({ translation: (result as AnyType)?.text || '' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
