import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import KanbanBoard from "@/components/admin/KanbanBoard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Kanban-style candidate pipeline board for recruiters
export default async function CandidateBoardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "recruiter") {
    redirect("/auth/signin");
  }

  // Fetch all candidates with their job info and round data
  const candidatesData = await prisma.candidate.findMany({
    where: {
      status: { not: "withdrawn" },
    },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      job: {
        select: {
          id: true,
          title: true,
        },
      },
      rounds: {
        select: {
          id: true,
          round: true,
          notes: true,
          rating: true,
          interviewer: true,
          interviewDate: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch all active jobs for the filter dropdown
  const jobs = await prisma.job.findMany({
    where: { isActive: true },
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  // Transform candidates to match expected type
  const transformedCandidates = candidatesData.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    status: c.status,
    job: c.job,
    rounds: c.rounds.map((r) => ({
      id: r.id,
      round: r.round,
      notes: r.notes,
      rating: r.rating,
      interviewer: r.interviewer,
      interviewDate: r.interviewDate?.toISOString() || null,
    })),
  }));

  return (
    <div className="min-h-screen bg-[#FCFAF7]">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/candidates"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back to Table View</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Candidate Pipeline</h1>
          <div className="w-[180px]" /> {/* Spacer for centering */}
        </div>

        {/* Kanban board */}
        <div className="h-[calc(100vh-140px)]">
          <KanbanBoard 
            initialCandidates={transformedCandidates} 
            jobs={jobs} 
          />
        </div>
      </div>
    </div>
  );
}
