import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Navbar from "@/components/Navbar"
import ApplicationsClient from "./ApplicationsClient"

export const dynamic = 'force-dynamic'

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

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">My Applications</h1>
          <p className="text-gray-600 text-lg">
            Track the status of your job applications
          </p>
        </div>

        <ApplicationsClient applications={applications} />
      </main>
    </div>
  )
}
