import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import KanbanBoard from "@/components/admin/KanbanBoard";


// Kanban-style candidate pipeline board for recruiters
export default async function CandidateBoardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "recruiter") {
    redirect("/auth/signin");
  }

  // Fetch all candidates with their job info and round data
  const candidatesData = await prisma.$queryRaw`
    SELECT 
      c.id, c.name, c.email, c.contact, c.linkedin, c.github, c.portfolio, c."resumeUrl", c.status, c."whyFit", c."finalEmailSent",
      j.id as "jobId", j.title as "jobTitle"
    FROM "Candidate" c
    JOIN "Job" j ON c."jobId" = j.id
    WHERE c.status != 'withdrawn'
    ORDER BY c."createdAt" DESC
  ` as Array<{
    id: string;
    name: string;
    email: string;
    contact: string;
    linkedin: string | null;
    github: string | null;
    portfolio: string | null;
    resumeUrl: string;
    status: string;
    whyFit: string | null;
    finalEmailSent: boolean;
    jobId: string;
    jobTitle: string;
  }>;

  // Fetch rounds separately
  const candidateIds = candidatesData.map(c => c.id);
  const roundsData = candidateIds.length > 0 ? await prisma.$queryRaw`
    SELECT id, "candidateId", round, notes, rating, interviewer, "interviewDate", "interviewEmailSent"
    FROM "CandidateRound"
    WHERE "candidateId" = ANY(${candidateIds})
  ` as Array<{
    id: string;
    candidateId: string;
    round: string;
    notes: string | null;
    rating: number | null;
    interviewer: string | null;
    interviewDate: Date | null;
    interviewEmailSent: boolean;
  }> : [];

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
  const transformedCandidates = candidatesData.map((c) => {
    const candidateRounds = roundsData.filter(r => r.candidateId === c.id);
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      contact: c.contact,
      linkedin: c.linkedin,
      github: c.github,
      portfolio: c.portfolio,
      resumeUrl: c.resumeUrl,
      whyFit: c.whyFit,
      status: c.status,
      finalEmailSent: c.finalEmailSent,
      job: {
        id: c.jobId,
        title: c.jobTitle,
      },
      rounds: candidateRounds.map((r) => ({
        id: r.id,
        round: r.round,
        notes: r.notes,
        rating: r.rating,
        interviewer: r.interviewer,
        interviewDate: r.interviewDate?.toISOString() || null,
        interviewEmailSent: r.interviewEmailSent,
      })),
    };
  });

  return (
    <div className="w-full min-w-0">
      {/* Kanban board */}
      <div className="h-[calc(100vh-200px)]">
        <KanbanBoard 
          initialCandidates={transformedCandidates} 
          jobs={jobs} 
        />
      </div>
    </div>
  );
}
