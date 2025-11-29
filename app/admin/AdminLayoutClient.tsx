"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isJobsPage = pathname === "/admin";
  const isCandidatesPage = pathname === "/admin/candidates" || pathname?.startsWith("/admin/candidates/") && !pathname?.includes("/board");
  const isBoardPage = pathname === "/admin/candidates/board";

  // Prefetch admin routes on mount for instant navigation
  useEffect(() => {
    router.prefetch("/admin");
    router.prefetch("/admin/candidates");
    router.prefetch("/admin/candidates/board");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FCFAF7]">
      <Navbar />
      
      <div className="border-b border-gray-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <nav className="flex flex-col md:flex-row md:justify-center items-center gap-1 md:gap-2">
            <span className="text-base md:text-lg font-semibold text-gray-700 py-3 md:py-0 md:mr-4">Admin Dashboard</span>
            <div className="flex w-full md:w-auto border-t md:border-t-0 border-gray-200">
              <Link 
                href="/admin"
                prefetch={true}
                className={`flex-1 md:flex-none px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-medium transition-colors relative text-center ${
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
                prefetch={true}
                className={`flex-1 md:flex-none px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-medium transition-colors relative text-center ${
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
              <Link 
                href="/admin/candidates/board"
                prefetch={true}
                className={`flex-1 md:flex-none px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-medium transition-colors relative text-center ${
                  isBoardPage
                    ? "text-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Tracking Board
                {isBoardPage && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                )}
              </Link>
            </div>
          </nav>
        </div>
      </div>

      <main className={`${isBoardPage ? 'max-w-[1340px] mx-auto' : 'max-w-7xl mx-auto'} px-4 md:px-8 py-6 md:py-8`}>
        {children}
      </main>
    </div>
  );
}
