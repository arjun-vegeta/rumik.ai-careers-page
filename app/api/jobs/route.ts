import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "recruiter") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, jobType, description, details, skills, isActive } = body

    if (!title || !description || !skills) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const job = await prisma.job.create({
      data: {
        title,
        jobType: jobType || "engineering",
        description,
        details: details || null,
        skills,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(job)
  } catch (error) {
    console.error("Create job error:", error)
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
  }
}
