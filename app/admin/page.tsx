import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import AdminJobsClient from "./AdminJobsClient"
import { Plus } from "lucide-react"

export const dynamic = 'force-dynamic'

// Admin dashboard for managing job postings and viewing applicant counts
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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">Job Postings</h1>
          <p className="text-gray-600 text-base md:text-lg">Manage all job postings and view applications</p>
        </div>
        <Link href="/admin/jobs/new" className="w-full md:w-auto">
          <Button className="w-full md:w-auto bg-black text-[#E5E0CD] hover:bg-[#E5E0CD] hover:border-2 hover:border-black hover:text-black transition-all duration-300 border-2 border-black flex items-center justify-center gap-2 py-3 md:py-2">
            <Plus size={18} />
            Create New Job
          </Button>
        </Link>
      </div>

      <AdminJobsClient jobs={jobs} />
    </div>
  )
}
