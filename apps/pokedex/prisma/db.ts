import { Prisma, PrismaClient } from '@prisma/client';
import { PokemonType } from '@src/types/api-types';

const prisma = new PrismaClient();

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

  return prisma.pokemon.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
  });
}
