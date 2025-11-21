import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminLayoutClient from "./AdminLayoutClient"

// Protects admin routes and ensures only recruiters can access
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== "recruiter") {
    redirect("/")
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
