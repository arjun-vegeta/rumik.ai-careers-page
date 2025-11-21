import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Updates the status of a candidate application
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    const candidate = await prisma.candidate.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(candidate);
  } catch (error) {
    console.error("Error updating candidate status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
