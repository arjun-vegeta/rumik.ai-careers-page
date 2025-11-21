import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Navbar from "@/components/Navbar"
import ApplicationsClient from "./ApplicationsClient"

export const dynamic = 'force-dynamic'

// Displays all job applications submitted by the current user
export default async function ApplicationsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  if (session.user.role === "recruiter") {
    redirect("/admin")
  }

  const applications = await prisma.candidate.findMany({
    where: { userId: session.user.id },
    include: { job: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-[#FCFAF7]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">My Applications</h1>
          <p className="text-gray-600 text-base md:text-lg">
            Track the status of your job applications
          </p>
        </div>

        <ApplicationsClient applications={applications} />
      </main>
    </div>
  )
}
