import { PrismaClient } from "@repo/prisma";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// Adding one apartment to the house
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apartmentListId, name, startDate } = body;

    if (!apartmentListId || !name || !startDate) {
      return NextResponse.json(
        { error: "apartmentListId, name, and startDate are required" },
        { status: 400 },
      );
    }

    const newApartment = await prisma.apartment.create({
      data: {
        name,
        startDate: new Date(startDate),
        apartmentListId,
      },
    });

    return NextResponse.json(newApartment, { status: 201 });
  } catch (error) {
    console.error("Error adding apartment:", error);
    return NextResponse.json(
      { error: "Failed to add apartment" },
      { status: 500 },
    );
  }
}

// Delete apartment
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Apartment ID is required" },
      { status: 400 },
    );
  }

  try {
    const deletedApartment = await prisma.apartment.delete({
      where: { id },
    });

    return NextResponse.json(deletedApartment, { status: 200 });
  } catch (error) {
    console.error("Error deleting apartment:", error);
    return NextResponse.json(
      { error: "Failed to delete apartment" },
      { status: 500 },
    );
  }
}

// Update apartment
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, startDate, endDate } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Apartment ID is required" },
        { status: 400 },
      );
    }

    const updatedApartment = await prisma.apartment.update({
      where: { id },
      data: {
        name,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null, // Update or reset
      },
    });

    return NextResponse.json(updatedApartment, { status: 200 });
  } catch (error) {
    console.error("Error updating apartment:", error);
    return NextResponse.json(
      { error: "Failed to update apartment" },
      { status: 500 },
    );
  }
}
