import { Prisma, PrismaClient } from '@repo/prisma';
import { log } from '@repo/utils';
import { PokemonType } from '@src/types/api-types';

// Reuse a single client across HMR reloads in dev; a fresh `new PrismaClient()`
// per reload exhausts the database connection pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export type PokemonsFilterType = {
  name?: string;
  types?: string[];
  minExperience?: number;
  maxExperience?: number;
  minAttack?: number;
  maxAttack?: number;
  page?: number;
  limit?: number;
};

// Apply only the bounds actually supplied — a defaulted 300/200 ceiling used to
// hide higher-stat Pokémon even with no filter set.
const numOrUndef = (v: unknown): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) ? v : undefined;

const rangeFilter = (
  min: unknown,
  max: unknown,
): Prisma.IntFilter | undefined => {
  const gte = numOrUndef(min);
  const lte = numOrUndef(max);
  const f: Prisma.IntFilter = {};
  if (gte !== undefined) f.gte = gte;
  if (lte !== undefined) f.lte = lte;
  return Object.keys(f).length ? f : undefined;
};

export async function getPokemons(
  filters: PokemonsFilterType,
): Promise<PokemonType[] | undefined> {
  const { name, types } = filters;

  // Clamp paging so bad input can't hit Prisma as a negative skip (500) or huge take.
  const page = Math.max(1, Math.trunc(Number(filters.page) || 1));
  const limit = Math.min(
    100,
    Math.max(1, Math.trunc(Number(filters.limit) || 18)),
  );

  const experience = rangeFilter(filters.minExperience, filters.maxExperience);
  const attack = rangeFilter(filters.minAttack, filters.maxAttack);

  const where: Prisma.PokemonWhereInput = {
    ...(name?.length && { name: { contains: name, mode: 'insensitive' } }),
    ...(types?.length && { types: { hasSome: types } }),
    ...(experience && { base_experience: experience }),
    ...(attack && { attack }),
  };

  try {
    return await prisma.pokemon.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });
  } catch (error) {
    log('Error in getPokemons:', error);
    throw new Error('Database error');
  }
}
