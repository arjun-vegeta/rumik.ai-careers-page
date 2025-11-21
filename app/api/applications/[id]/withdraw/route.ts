import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Allows candidates to withdraw their submitted applications
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if application exists and belongs to user
    const application = await prisma.candidate.findUnique({
      where: { id },
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    if (application.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (application.status !== "submitted") {
      return NextResponse.json(
        { error: "Can only withdraw submitted applications" },
        { status: 400 }
      )
    }

    // Update status to withdrawn
    await prisma.candidate.update({
      where: { id },
      data: { status: "withdrawn" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Withdraw application error:", error)
    return NextResponse.json(
      { error: "Failed to withdraw application" },
      { status: 500 }
    )
  }
}
