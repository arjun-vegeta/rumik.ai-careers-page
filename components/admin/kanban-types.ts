// Shared types for the Kanban board components

export interface CandidateRound {
  id?: string;
  round: string;
  notes?: string | null;
  rating?: number | null;
  interviewer?: string | null;
  interviewDate?: string | null;
  interviewEmailSent?: boolean;
}

export interface KanbanCandidate {
  id: string;
  name: string;
  email: string;
  status: string;
  contact?: string | null;
  linkedin?: string | null;
  github?: string | null;
  portfolio?: string | null;
  resumeUrl?: string | null;
  whyFit?: string | null;
  finalEmailSent?: boolean;
  job: {
    id: string;
    title: string;
  };
  rounds?: CandidateRound[];
}

export interface Job {
  id: string;
  title: string;
}
