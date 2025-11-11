"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isJobsPage = pathname === "/admin";
  const isCandidatesPage = pathname?.startsWith("/admin/candidates");

  return (
    <div className="min-h-screen bg-[#FCFAF7]">
      <Navbar />
      
      <div className="border-b border-gray-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-8">
          <nav className="flex justify-center items-center gap-2">
            <span className="text-lg font-semibold text-gray-700 mr-4">Admin Dashboard</span>
            <Link 
              href="/admin"
              className={`px-6 py-4 font-medium transition-colors relative ${
                isJobsPage
                  ? "text-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Jobs
              {isJobsPage && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </Link>
            <Link 
              href="/admin/candidates"
              className={`px-6 py-4 font-medium transition-colors relative ${
                isCandidatesPage
                  ? "text-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Candidates
              {isCandidatesPage && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
              )}
            </Link>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {children}
      </main>
    </div>
  );
}
