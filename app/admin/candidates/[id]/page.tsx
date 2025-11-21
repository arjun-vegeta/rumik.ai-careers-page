import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import AIInsightButton from "@/components/AIInsightButton"
import StatusUpdateButton from "@/components/StatusUpdateButton"

export const dynamic = 'force-dynamic'

// Detailed view of a single candidate with AI insights
export default async function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      job: true,
      user: true,
      aiInsights: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!candidate) {
    notFound()
  }

  const latestInsight = candidate.aiInsights[0]

  return (
    <div className="max-w-4xl">
      <Link href="/admin/candidates" className="text-sm md:text-base text-gray-600 hover:text-black mb-3 md:mb-4 inline-block">
        ← Back to Candidates
      </Link>

      <div className="grid gap-4 md:gap-6 mt-4 md:mt-6">
        <Card>
          <CardHeader className="px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
              <div className="flex-1">
                <CardTitle className="text-xl md:text-2xl">{candidate.name}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="text-xs md:text-sm">{candidate.job.title}</Badge>
                  <Badge variant="secondary" className="text-xs md:text-sm">
                    Applied {new Date(candidate.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
              <StatusUpdateButton 
                candidateId={candidate.id}
                currentStatus={candidate.status}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4 px-4 md:px-6">
            <div>
              <p className="text-xs md:text-sm font-semibold text-gray-600">Email</p>
              <p className="text-sm md:text-base break-words">{candidate.email}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm font-semibold text-gray-600">Phone</p>
              <p className="text-sm md:text-base">{candidate.contact}</p>
            </div>
            {candidate.linkedin && (
              <div>
                <p className="text-xs md:text-sm font-semibold text-gray-600">LinkedIn</p>
                <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm md:text-base text-blue-600 hover:underline break-all">
                  {candidate.linkedin}
                </a>
              </div>
            )}
            {candidate.github && (
              <div>
                <p className="text-xs md:text-sm font-semibold text-gray-600">GitHub</p>
                <a href={candidate.github} target="_blank" rel="noopener noreferrer" className="text-sm md:text-base text-blue-600 hover:underline break-all">
                  {candidate.github}
                </a>
              </div>
            )}
            {candidate.portfolio && (
              <div>
                <p className="text-xs md:text-sm font-semibold text-gray-600">Portfolio</p>
                <a href={candidate.portfolio} target="_blank" rel="noopener noreferrer" className="text-sm md:text-base text-blue-600 hover:underline break-all">
                  {candidate.portfolio}
                </a>
              </div>
            )}
            <div>
              <p className="text-xs md:text-sm font-semibold text-gray-600">Resume</p>
              <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="text-xs md:text-sm">Download Resume</Button>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-lg md:text-xl">Why This Role?</CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <p className="text-sm md:text-base whitespace-pre-wrap">{candidate.whyFit}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 md:px-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <CardTitle className="text-lg md:text-xl">AI Insights</CardTitle>
              <AIInsightButton 
                candidateId={candidate.id}
                jobId={candidate.jobId}
              />
            </div>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            {latestInsight ? (
              <div className="space-y-3 md:space-y-4">
                <div>
                  <p className="text-xs md:text-sm font-semibold text-gray-600">Match Score</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-2xl md:text-3xl font-bold">{latestInsight.score}</div>
                    <div className="text-sm md:text-base text-gray-500">/100</div>
                  </div>
                </div>
                <div>
                  <p className="text-xs md:text-sm font-semibold text-gray-600 mb-2">Key Insights</p>
                  <ul className="space-y-2">
                    {latestInsight.insights.map((insight, idx) => (
                      <li key={idx} className="flex gap-2 text-sm md:text-base">
                        <span className="text-gray-400">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-gray-500">
                  Generated {new Date(latestInsight.createdAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-sm md:text-base text-gray-500">No AI insights generated yet. Click the button above to generate.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
