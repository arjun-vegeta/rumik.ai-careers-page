import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Fetches all round data for a candidate
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "recruiter") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const rounds = await prisma.candidateRound.findMany({
      where: { candidateId: id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(rounds);
  } catch (error) {
    console.error("Error fetching rounds:", error);
    return NextResponse.json(
      { error: "Failed to fetch rounds" },
      { status: 500 }
    );
  }
}

// Creates or updates round notes for a candidate
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "recruiter") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { round, notes, rating, interviewer, interviewDate } = body;

    if (!round) {
      return NextResponse.json(
        { error: "Round is required" },
        { status: 400 }
      );
    }

    // Upsert - create if doesn't exist, update if it does
    const roundData = await prisma.candidateRound.upsert({
      where: {
        candidateId_round: {
          candidateId: id,
          round: round,
        },
      },
      update: {
        notes,
        rating,
        interviewer,
        interviewDate: interviewDate ? new Date(interviewDate) : null,
      },
      create: {
        candidateId: id,
        round,
        notes,
        rating,
        interviewer,
        interviewDate: interviewDate ? new Date(interviewDate) : null,
      },
    });

    return NextResponse.json(roundData);
  } catch (error) {
    console.error("Error saving round:", error);
    return NextResponse.json(
      { error: "Failed to save round" },
      { status: 500 }
    );
  }
}
