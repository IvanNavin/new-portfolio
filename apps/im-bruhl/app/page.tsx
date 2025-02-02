"use server";
import { HousePage } from "@app/components/HousePage";
import { ApartmentListType } from "@app/types";
import { PrismaClient } from "@repo/prisma";

const prisma = new PrismaClient();

export default async function HomePage() {
  const apartmentList = (await prisma.apartmentList.findMany({
    include: { apartments: true },
  })) as ApartmentListType[];

  return <HousePage apartmentList={apartmentList[0]} />;
}
