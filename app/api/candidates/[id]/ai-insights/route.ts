import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Generates AI-powered insights about candidate-job fit using Gemini
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "recruiter") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured. Please add GEMINI_API_KEY to your .env file." },
        { status: 500 }
      );
    }

    const { id: candidateId } = await params;

    // Check if insights already exist
    const existingInsight = await prisma.aIInsight.findFirst({
      where: { candidateId },
    });

    if (existingInsight) {
      return NextResponse.json(existingInsight);
    }

    // Fetch candidate with job details
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { job: true },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    // Generate AI insights using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert recruiter analyzing a candidate's fit for a job position.

Job Title: ${candidate.job.title}
Job Description: ${candidate.job.description}
Required Skills: ${candidate.job.skills.join(", ")}

Candidate's Resume: ${candidate.resumeText || "Not available"}
Why They're a Good Fit: ${candidate.whyFit}

Based on the above information, provide:
1. A score out of 100 indicating how well the candidate matches the job requirements
2. Exactly 3 key insights about the candidate (strengths, concerns, or recommendations)

Format your response as JSON:
{
  "score": <number between 0-100>,
  "insights": ["insight 1", "insight 2", "insight 3"]
}

Be objective, concise, and focus on skills match, experience relevance, and cultural fit indicators.`;

    console.log("Generating AI insights for candidate:", candidateId);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("AI Response:", text);

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Failed to parse AI response. Raw text:", text);
      throw new Error("Failed to parse AI response");
    }

    const aiResponse = JSON.parse(jsonMatch[0]);
    console.log("Parsed AI response:", aiResponse);

    // Validate response
    if (
      typeof aiResponse.score !== "number" ||
      !Array.isArray(aiResponse.insights) ||
      aiResponse.insights.length !== 3
    ) {
      throw new Error("Invalid AI response format");
    }

    // Store in database
    const aiInsight = await prisma.aIInsight.create({
      data: {
        candidateId,
        jobJD: candidate.job.description,
        resumeText: candidate.resumeText || "",
        score: Math.min(100, Math.max(0, aiResponse.score)),
        insights: aiResponse.insights,
      },
    });

    return NextResponse.json(aiInsight);
  } catch (error: any) {
    console.error("Error generating AI insights:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate AI insights" },
      { status: 500 }
    );
  }
}

// Retrieves existing AI insights for a candidate
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "recruiter") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: candidateId } = await params;

    const aiInsight = await prisma.aIInsight.findFirst({
      where: { candidateId },
    });

    if (!aiInsight) {
      return NextResponse.json(
        { error: "AI insights not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(aiInsight);
  } catch (error: any) {
    console.error("Error fetching AI insights:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI insights" },
      { status: 500 }
    );
  }
}
