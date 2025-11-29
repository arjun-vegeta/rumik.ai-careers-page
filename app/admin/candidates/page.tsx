import { prisma } from "@/lib/prisma"
import AllCandidatesClient from "./AllCandidatesClient"
import Link from "next/link"
import { LayoutGrid } from "lucide-react"

// Cache for 30 seconds, revalidate in background
export const revalidate = 30

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
          orderBy: { createdAt: 'desc' }
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
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">All Candidates</h1>
          <p className="text-gray-600 text-base md:text-lg">View and manage all job applications</p>
        </div>
        <Link
          href="/admin/candidates/board"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm md:text-base"
        >
          <LayoutGrid size={18} />
          Pipeline Board
        </Link>
      </div>

      <AllCandidatesClient candidates={candidates} allJobs={jobs.map(j => j.title)} />
    </div>
  )
}
