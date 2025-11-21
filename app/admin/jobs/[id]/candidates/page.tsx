import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import CandidatesClient from "./CandidatesClient"

export const dynamic = 'force-dynamic'

// Shows all candidates who applied for a specific job
export default async function JobCandidatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      candidates: {
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
          aiInsights: {
            select: {
              score: true,
              insights: true,
            },
            take: 1,
          },
        },
      },
    },
  })

  if (!job) {
    notFound()
  }

  return (
    <div>
      <Link href="/admin" className="text-sm md:text-base text-gray-600 hover:text-black mb-3 md:mb-4 inline-block">
        ← Back to Jobs
      </Link>

      <div className="mt-4 md:mt-6 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{job.title}</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant={job.isActive ? "default" : "secondary"} className="text-xs md:text-sm">
            {job.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge variant="outline" className="text-xs md:text-sm">{job.candidates.length} applicants</Badge>
        </div>
      </div>

      <CandidatesClient candidates={job.candidates} />
    </div>
  )
}
