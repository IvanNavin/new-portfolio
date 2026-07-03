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

export async function getPokemons({
  name,
  types,
  minExperience = 0,
  maxExperience = 300,
  minAttack = 0,
  maxAttack = 200,
  page = 1,
  limit = 18,
}: PokemonsFilterType): Promise<PokemonType[] | undefined> {
  const where: Prisma.PokemonWhereInput = {
    ...(name?.length && { name: { contains: name, mode: 'insensitive' } }),
    ...(types?.length && { types: { hasSome: types } }),
    base_experience: {
      gte: minExperience,
      lte: maxExperience,
    },
    attack: {
      gte: minAttack,
      lte: maxAttack,
    },
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
