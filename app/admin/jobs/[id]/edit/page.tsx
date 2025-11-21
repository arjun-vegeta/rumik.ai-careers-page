import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import JobForm from "@/components/JobForm"

export const dynamic = 'force-dynamic'

// Edit existing job posting
export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await prisma.job.findUnique({
    where: { id },
  })

  if (!job) {
    notFound()
  }

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Edit Job</h2>
      <JobForm job={job} />
    </div>
  )
}
