import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

// Generates AI insights using Gemini to evaluate candidate fit for a job
async function generateInsight(
  jobTitle: string,
  jobDescription: string,
  skills: string[],
  candidateName: string,
  whyFit: string,
  resumeText: string
) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `You are an expert technical recruiter analyzing a job candidate.

Job Position: ${jobTitle}

Job Description:
${jobDescription}

Required Skills: ${skills.join(", ")}

Candidate Information:
- Name: ${candidateName}
- Why they're interested: ${whyFit}
- Resume/Background: ${resumeText || "Resume text not available"}

Please analyze this candidate and provide:
1. A match score from 0-100 (where 100 is a perfect match)
2. 4-6 specific insights about their fit for this role

Consider:
- Technical skill alignment
- Experience relevance
- Cultural fit indicators
- Potential concerns or gaps
- Unique strengths

Respond ONLY with valid JSON in this exact format:
{
  "score": <number between 0-100>,
  "insights": [
    "insight 1",
    "insight 2",
    "insight 3",
    "insight 4"
  ]
}

Do not include any text outside the JSON object.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()
    
    // Extract JSON from response (handle markdown code blocks if present)
    let jsonText = response.trim()
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "")
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "")
    }
    
    const parsed = JSON.parse(jsonText)
    
    return {
      score: Math.max(0, Math.min(100, parsed.score)),
      insights: parsed.insights || []
    }
  } catch (error) {
    console.error("Gemini API error:", error)
    
    // Fallback to simple heuristic if Gemini fails
    return generateFallbackInsight(skills, whyFit, resumeText)
  }
}

// Provides basic skill-matching analysis when AI service is unavailable
function generateFallbackInsight(skills: string[], whyFit: string, resumeText: string) {
  const insights: string[] = []
  let score = 50

  const combinedText = (whyFit + " " + resumeText).toLowerCase()
  const matchedSkills = skills.filter(skill => 
    combinedText.includes(skill.toLowerCase())
  )
  
  if (matchedSkills.length > 0) {
    score += Math.min(30, matchedSkills.length * 10)
    insights.push(`Found ${matchedSkills.length} required skills: ${matchedSkills.join(', ')}`)
  } else {
    insights.push("Limited skill match detected")
  }

  if (combinedText.length > 2000) {
    score += 10
    insights.push("Extensive experience demonstrated")
  }

  const keywords = ['experience', 'project', 'led', 'managed', 'developed', 'built']
  const keywordMatches = keywords.filter(kw => combinedText.includes(kw))
  if (keywordMatches.length >= 4) {
    score += 10
    insights.push("Strong action-oriented language in application")
  }

  insights.push("Note: AI analysis unavailable, using basic matching")

  return { score: Math.max(0, Math.min(100, score)), insights }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "recruiter") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { candidateId, jobId } = body

    if (!candidateId || !jobId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Fetch candidate and job data
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { job: true },
    })

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 })
    }

    const job = candidate.job

    // Extract resume text (in production, use PDF parser)
    let resumeText = candidate.resumeText || ""
    if (!resumeText) {
      // If resume text is not available, use the whyFit text and note about resume
      resumeText = `Resume file available at: ${candidate.resumeUrl}. Candidate's statement: ${candidate.whyFit}`
    }

    // Generate AI insights using Gemini
    const { score, insights } = await generateInsight(
      job.title,
      job.description,
      job.skills,
      candidate.name,
      candidate.whyFit,
      resumeText
    )

    // Store in database
    await prisma.aIInsight.create({
      data: {
        candidateId,
        jobJD: job.description,
        resumeText,
        score,
        insights,
      },
    })

    return NextResponse.json({ score, insights })
  } catch (error) {
    console.error("AI insight error:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
