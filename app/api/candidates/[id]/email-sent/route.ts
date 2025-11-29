import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Mark email as sent for a candidate
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "recruiter") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { type, round } = body;

  try {
    if (type === "final") {
      // Mark final email (offer/rejection) as sent
      await prisma.candidate.update({
        where: { id },
        data: { finalEmailSent: true },
      });
    } else if (type === "interview" && round) {
      // Mark interview email as sent for a specific round using upsert
      await prisma.candidateRound.upsert({
        where: {
          candidateId_round: {
            candidateId: id,
            round: round,
          },
        },
        update: { interviewEmailSent: true },
        create: {
          candidateId: id,
          round: round,
          interviewEmailSent: true,
        },
      });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking email as sent:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update email status", details: errorMessage },
      { status: 500 }
    );
  }
}
