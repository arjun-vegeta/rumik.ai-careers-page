import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import AdminJobsClient from "./AdminJobsClient"
import { Plus } from "lucide-react"

export default async function AdminJobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      jobType: true,
      isActive: true,
      _count: {
        select: { 
          candidates: {
            where: {
              status: {
                not: "withdrawn"
              }
            }
          }
        }
      }
    }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Job Postings</h1>
          <p className="text-gray-600 text-lg">Manage all job postings and view applications</p>
        </div>
        <Link href="/admin/jobs/new">
          <Button className="bg-black text-[#F5E69A] hover:bg-gray-800 flex items-center gap-2">
            <Plus size={18} />
            Create New Job
          </Button>
        </Link>
      </div>

      <AdminJobsClient jobs={jobs} />
    </div>
  )
}
