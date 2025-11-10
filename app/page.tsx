import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function CareersPage() {
  const session = await auth()
  const jobs = await prisma.job.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  })

  const engineeringJobs = jobs.filter(j => j.jobType === 'engineering')
  const otherJobs = jobs.filter(j => j.jobType === 'other')
  const internships = jobs.filter(j => j.jobType === 'internship')

  const JobCard = ({ job }: { job: any }) => (
    <Card key={job.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
            <CardDescription className="text-base">
              {job.description.substring(0, 200)}...
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.map((skill: string) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
        <Link href={`/jobs/${job.id}`}>
          <Button className="bg-black text-[#FFF4B3] hover:bg-gray-800">
            View Details & Apply
          </Button>
        </Link>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Careers</h1>
          <div className="flex gap-4 items-center">
            {session?.user ? (
              <>
                <span className="text-sm text-gray-600">{session.user.email}</span>
                {session.user.role === 'recruiter' && (
                  <Link href="/admin">
                    <Button variant="outline">Admin Dashboard</Button>
                  </Link>
                )}
              </>
            ) : (
              <Link href="/auth/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4">✅ Open Roles</h2>
          <p className="text-gray-600 text-lg">
            We're looking for talented individuals to help us build the future.
          </p>
        </div>

        {jobs.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No open positions at the moment.</p>
        ) : (
          <div className="space-y-12">
            {engineeringJobs.length > 0 && (
              <section>
                <h3 className="text-2xl font-bold mb-6">Engineering Roles</h3>
                <div className="grid gap-6">
                  {engineeringJobs.map((job) => <JobCard key={job.id} job={job} />)}
                </div>
              </section>
            )}

            {otherJobs.length > 0 && (
              <section>
                <h3 className="text-2xl font-bold mb-6">Other Roles</h3>
                <div className="grid gap-6">
                  {otherJobs.map((job) => <JobCard key={job.id} job={job} />)}
                </div>
              </section>
            )}

            {internships.length > 0 && (
              <section>
                <h3 className="text-2xl font-bold mb-6">👷 Internships</h3>
                <div className="grid gap-6">
                  {internships.map((job) => <JobCard key={job.id} job={job} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
