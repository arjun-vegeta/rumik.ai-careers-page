import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import ApplyForm from "@/components/ApplyForm"
import Navbar from "@/components/Navbar"

export const dynamic = 'force-dynamic'

// Displays full job posting details with application form
export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await prisma.job.findUnique({
    where: { id },
  })

  if (!job || !job.isActive) {
    notFound()
  }

  const session = await auth()

  return (
    <div className="min-h-screen bg-[#FCFAF7]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">{job.title}</h1>
          <div className="flex flex-wrap gap-1.5 md:gap-2 mb-4 md:mb-6">
            {job.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs md:text-sm">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div className="prose max-w-none mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Job Description</h2>
          <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap mb-4 md:mb-6">{job.description}</p>
          
          {job.details && (
            <>
              <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Additional Details</h2>
              <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap">{job.details}</p>
            </>
          )}
        </div>

        <div className="border-t pt-8 md:pt-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Apply for this position</h2>
          <ApplyForm job={job} session={session} />
        </div>
      </main>
    </div>
  )
}
