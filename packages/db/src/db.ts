import { PrismaClient } from "@prisma/client";

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
  minExperience,
  maxExperience,
  minAttack,
  maxAttack,
  page = 1,
  limit = 9,
}: PokemonsFilterType) {
  const where: any = {
    ...(name && { name: { contains: name, mode: "insensitive" } }),
    ...(types && { types: { hasSome: types } }),
    ...(minExperience && { base_experience: { gte: minExperience } }),
    ...(maxExperience && { base_experience: { lte: maxExperience } }),
    ...(minAttack && { attack: { gte: minAttack } }),
    ...(maxAttack && { attack: { lte: maxAttack } }),
  };

  return prisma.pokemon.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
  });
}
