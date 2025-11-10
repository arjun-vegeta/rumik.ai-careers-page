import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ApplyForm from "@/components/ApplyForm"

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
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-gray-600 hover:text-black">
            ← Back to Careers
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{job.title}</h1>
          <div className="flex flex-wrap gap-2 mb-6">
            {job.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div className="prose max-w-none mb-12">
          <h2 className="text-2xl font-bold mb-4">Job Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap mb-6">{job.description}</p>
          
          {job.details && (
            <>
              <h2 className="text-2xl font-bold mb-4">Additional Details</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{job.details}</p>
            </>
          )}
        </div>

        <div className="border-t pt-12">
          <h2 className="text-3xl font-bold mb-6">Apply for this position</h2>
          <ApplyForm job={job} session={session} />
        </div>
      </main>
    </div>
  )
}
