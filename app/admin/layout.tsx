import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== "recruiter") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-[#FCFAF7]">
      <Navbar />
      
      <div className="border-b border-gray-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <nav className="flex gap-6 items-center">
            <h2 className="text-xl font-semibold text-gray-700">Admin:</h2>
            <Link href="/admin">
              <Button variant="ghost" className="text-base">Jobs</Button>
            </Link>
            <Link href="/admin/candidates">
              <Button variant="ghost" className="text-base">Candidates</Button>
            </Link>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {children}
      </main>
    </div>
  )
}
