import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { uploadResume } from "@/lib/supabase"
import { sendApplicationConfirmation } from "@/lib/email"

// Handles job application submissions with resume upload
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const jobId = formData.get("jobId") as string
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const contact = formData.get("contact") as string
    const whyFit = formData.get("whyFit") as string
    const portfolio = formData.get("portfolio") as string | null
    const linkedin = formData.get("linkedin") as string | null
    const github = formData.get("github") as string | null
    const resume = formData.get("resume") as File

    if (!jobId || !name || !email || !contact || !whyFit || !resume) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } })
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Generate temporary candidate ID for file naming
    const tempCandidateId = `${Date.now()}-${Math.random().toString(36).substring(7)}`
    
    // Upload resume to Supabase Storage
    const resumeUrl = await uploadResume(resume, tempCandidateId)

    // Create candidate
    const candidate = await prisma.candidate.create({
      data: {
        userId: session.user.id,
        jobId,
        name,
        email,
        contact,
        whyFit,
        portfolio: portfolio || null,
        linkedin: linkedin || null,
        github: github || null,
        resumeUrl,
      },
    })

    // Send confirmation email
    await sendApplicationConfirmation({
      candidateName: name,
      candidateEmail: email,
      jobTitle: job.title,
    }).catch((err) => console.error("Failed to send confirmation email:", err))

    return NextResponse.json({ success: true, candidate })
  } catch (error: any) {
    console.error("Application error:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ error: "You have already applied for this job" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
  }
}
