import { prisma } from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import RolesClient from "./RolesClient"
import { Suspense } from "react"
import ToastHandler from "@/components/ToastHandler"

export const dynamic = 'force-dynamic'

// Public page displaying all active job openings
export default async function RolesPage() {
  const allJobs = await prisma.job.findMany({
    where: { isActive: true },
    select: {
      id: true,
      title: true,
      description: true,
      jobType: true,
      salary: true,
    },
  })

  // Sort jobs: engineering first, then other, then internship
  const jobs = allJobs.sort((a, b) => {
    const order = { engineering: 1, other: 2, internship: 3 }
    return order[a.jobType as keyof typeof order] - order[b.jobType as keyof typeof order]
  })

  return (
    <div className="min-h-screen bg-[#FCFAF7]">
      <Navbar />
      <Suspense fallback={null}>
        <ToastHandler />
      </Suspense>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">Open Roles</h1>
          <p className="text-gray-600 text-base md:text-lg">
            Join our team and help us build the most human AI.
          </p>
        </div>

        <RolesClient jobs={jobs} />
      </main>
    </div>
  )
}
