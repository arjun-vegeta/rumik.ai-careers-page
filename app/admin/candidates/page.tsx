import { prisma } from "@/lib/prisma"
import AllCandidatesClient from "./AllCandidatesClient"

export const dynamic = 'force-dynamic'

// Shows all candidates across all job postings (excluding withdrawn applications)
export default async function CandidatesPage() {
  const [candidates, jobs] = await Promise.all([
    prisma.candidate.findMany({
      where: {
        status: {
          not: "withdrawn"
        }
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        contact: true,
        whyFit: true,
        portfolio: true,
        linkedin: true,
        github: true,
        resumeUrl: true,
        status: true,
        createdAt: true,
        job: {
          select: {
            title: true,
          },
        },
        aiInsights: {
          select: {
            score: true,
            insights: true,
          },
          take: 1,
        },
      },
    }),
    prisma.job.findMany({
      where: { isActive: true },
      select: {
        title: true,
      },
      orderBy: { title: 'asc' },
    })
  ]);

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">All Candidates</h1>
        <p className="text-gray-600 text-base md:text-lg">View and manage all job applications</p>
      </div>

      <AllCandidatesClient candidates={candidates} allJobs={jobs.map(j => j.title)} />
    </div>
  )
}
