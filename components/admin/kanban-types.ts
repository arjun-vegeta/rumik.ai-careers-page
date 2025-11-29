// Shared types for the Kanban board components

export interface CandidateRound {
  id?: string;
  round: string;
  notes?: string | null;
  rating?: number | null;
  interviewer?: string | null;
  interviewDate?: string | null;
}

export interface KanbanCandidate {
  id: string;
  name: string;
  email: string;
  status: string;
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
