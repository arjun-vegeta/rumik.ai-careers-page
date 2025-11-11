import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import WithdrawButton from "@/components/WithdrawButton"
import Navbar from "@/components/Navbar"

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

  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusConfig = (s: string) => {
      switch (s) {
        case "submitted":
          return { label: "Submitted", className: "bg-blue-100 text-blue-800 border-blue-200" }
        case "in_review":
          return { label: "In Review", className: "bg-yellow-100 text-yellow-800 border-yellow-200" }
        case "selected":
          return { label: "Selected", className: "bg-green-100 text-green-800 border-green-200" }
        case "rejected":
          return { label: "Rejected", className: "bg-red-100 text-red-800 border-red-200" }
        case "withdrawn":
          return { label: "Withdrawn", className: "bg-gray-100 text-gray-800 border-gray-200" }
        default:
          return { label: s, className: "bg-gray-100 text-gray-800 border-gray-200" }
      }
    }

    const config = getStatusConfig(status)
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-[#FCFAF7]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Applications</h1>
          <p className="text-gray-600">
            Track the status of your job applications
          </p>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">You haven't applied to any jobs yet.</p>
              <Link href="/">
                <Button className="bg-black text-[#FFF4B3] hover:bg-gray-800">
                  Browse Open Positions
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl mb-2">
                        {application.job.title}
                      </CardTitle>
                      <div className="flex gap-2 items-center">
                        <StatusBadge status={application.status} />
                        <span className="text-sm text-gray-500">
                          Applied {new Date(application.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {application.status === "submitted" && (
                      <WithdrawButton applicationId={application.id} />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Why you're a good fit:</p>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {application.whyFit}
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      {application.portfolio && (
                        <a
                          href={application.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-black"
                        >
                          Portfolio ↗
                        </a>
                      )}
                      {application.linkedin && (
                        <a
                          href={application.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-black"
                        >
                          LinkedIn ↗
                        </a>
                      )}
                      {application.github && (
                        <a
                          href={application.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-black"
                        >
                          GitHub ↗
                        </a>
                      )}
                      <a
                        href={application.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-black"
                      >
                        Resume ↗
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
