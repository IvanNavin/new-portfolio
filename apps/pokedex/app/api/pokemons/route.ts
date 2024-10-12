import { getPokemons, PokemonsFilterType } from '@root/prisma/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const filters: Partial<PokemonsFilterType> = await request.json(); // Отримання фільтрів з тіла запиту
  try {
    const data = await getPokemons(filters);
    return NextResponse.json(data); // Повертаємо дані у форматі JSON
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch pokemons' },
      { status: 500 },
    );
  }
}
