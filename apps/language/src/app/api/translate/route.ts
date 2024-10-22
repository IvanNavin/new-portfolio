import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word');

  if (!word) {
    return NextResponse.json({ error: 'No word provided' }, { status: 400 });
  }

  const url = `https://lingvanex-translate.p.rapidapi.com/translate?from=en_GB&to=ru&text=${word}`;
  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': process.env.X_RAPIDAPI_KEY!,
      'x-rapidapi-host': process.env.X_RAPIDAPI_HOST!,
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
