import { PokemonTypeResponse } from '@src/types/api-types';
import { NextResponse } from 'next/server';

export async function GET() {
  const response = await fetch('https://pokeapi.co/api/v2/type?limit=100');
  const data: PokemonTypeResponse = await response.json();

  const validTypes = data.results.filter(
    (type) => type.name !== 'shadow' && type.name !== 'unknown',
  );

  return NextResponse.json(validTypes);
}
