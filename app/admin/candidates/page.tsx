import { prisma } from "@/lib/prisma"
import AllCandidatesClient from "./AllCandidatesClient"

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
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">All Candidates</h1>
        <p className="text-gray-600 text-lg">View and manage all job applications</p>
      </div>

      <AllCandidatesClient candidates={candidates} allJobs={jobs.map(j => j.title)} />
    </div>
  )
}
