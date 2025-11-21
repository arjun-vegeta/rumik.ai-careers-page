import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Updates an existing job posting (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "recruiter") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, jobType, description, details, skills, isActive } = body
    const { id } = await params

    const job = await prisma.job.update({
      where: { id },
      data: {
        title,
        jobType: jobType || "engineering",
        description,
        details: details || null,
        skills,
        isActive,
      },
    })

    return NextResponse.json(job)
  } catch (error) {
    console.error("Update job error:", error)
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 })
  }
}
