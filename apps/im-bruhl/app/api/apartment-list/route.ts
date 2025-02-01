import { PrismaClient } from "@repo/prisma";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// Creating a new home
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newApartmentList = await prisma.apartmentList.create({
      data: { name },
    });

    return NextResponse.json(newApartmentList, { status: 201 });
  } catch (error) {
    console.error("Error creating apartment list:", error);
    return NextResponse.json(
      { error: "Failed to create apartment list" },
      { status: 500 },
    );
  }
}

// Get list of houses by ID
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (id) {
    try {
      const apartmentList = await prisma.apartmentList.findUnique({
        where: { id },
        include: { apartments: true },
      });

      if (!apartmentList) {
        return NextResponse.json(
          { error: "Apartment list not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(apartmentList);
    } catch (error) {
      console.error("Error fetching apartment list:", error);
      return NextResponse.json(
        { error: "Failed to fetch apartment list" },
        { status: 500 },
      );
    }
  }

  // If ID is not transferred - return all the lists of houses
  try {
    const apartmentLists = await prisma.apartmentList.findMany({
      include: { apartments: true },
    });

    return NextResponse.json(apartmentLists);
  } catch (error) {
    console.error("Error fetching apartment lists:", error);
    return NextResponse.json(
      { error: "Failed to fetch apartment lists" },
      { status: 500 },
    );
  }
}
