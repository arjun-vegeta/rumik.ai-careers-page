"use client";

import { useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import KanbanColumn from "./KanbanColumn";
import FinalColumn from "./FinalColumn";
import RoundNotesDialog from "./RoundNotesDialog";
import { CandidateRound, KanbanCandidate, Job } from "./kanban-types";

interface KanbanBoardProps {
  initialCandidates: KanbanCandidate[];
  jobs: Job[];
}

// Column configuration with colors
const columns = [
  { id: "applied", title: "Applied", color: "bg-blue-100" },
  { id: "round_1", title: "Round 1", color: "bg-yellow-100" },
  { id: "round_2", title: "Round 2", color: "bg-orange-100" },
  { id: "round_3", title: "Round 3", color: "bg-purple-100" },
];

// Main Kanban board for tracking candidates through the hiring pipeline
export default function KanbanBoard({ initialCandidates, jobs }: KanbanBoardProps) {
  const router = useRouter();
  const [candidates, setCandidates] = useState<KanbanCandidate[]>(initialCandidates);
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [isUpdating, setIsUpdating] = useState(false);

  // Notes dialog state
  const [notesDialog, setNotesDialog] = useState<{
    isOpen: boolean;
    candidateId: string;
    candidateName: string;
    round: string;
    existingData: CandidateRound | null;
  }>({
    isOpen: false,
    candidateId: "",
    candidateName: "",
    round: "",
    existingData: null,
  });

  // Filter candidates by selected job
  const filteredCandidates = selectedJob === "all"
    ? candidates
    : candidates.filter((c) => c.job.id === selectedJob);

  // Group candidates by status
  const groupedCandidates = {
    applied: filteredCandidates.filter((c) => c.status === "applied"),
    round_1: filteredCandidates.filter((c) => c.status === "round_1"),
    round_2: filteredCandidates.filter((c) => c.status === "round_2"),
    round_3: filteredCandidates.filter((c) => c.status === "round_3"),
    selected: filteredCandidates.filter((c) => c.status === "selected"),
    rejected: filteredCandidates.filter((c) => c.status === "rejected"),
  };

  // Handle drag end - update candidate status
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a valid area
    if (!destination) return;

    // Dropped in the same place
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Find the candidate being moved
    const candidate = candidates.find((c) => c.id === draggableId);
    if (!candidate) return;

    const newStatus = destination.droppableId;

    // Optimistically update the UI
    setCandidates((prev) =>
      prev.map((c) => (c.id === draggableId ? { ...c, status: newStatus } : c))
    );

    // Update on the server
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/candidates/${draggableId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Refresh to get latest data
      router.refresh();
    } catch (error) {
      console.error("Error updating status:", error);
      // Revert on error
      setCandidates((prev) =>
        prev.map((c) => (c.id === draggableId ? { ...c, status: source.droppableId } : c))
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Open notes dialog for a candidate
  const handleAddNotes = (candidateId: string, round: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return;

    const existingRound = candidate.rounds?.find((r: CandidateRound) => r.round === round);

    setNotesDialog({
      isOpen: true,
      candidateId,
      candidateName: candidate.name,
      round,
      existingData: existingRound || null,
    });
  };

  // Handle notes save
  const handleNotesSave = (savedData: CandidateRound) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === notesDialog.candidateId) {
          const existingRoundIndex = c.rounds?.findIndex((r: CandidateRound) => r.round === savedData.round) ?? -1;
          const updatedRounds = [...(c.rounds || [])];
          
          if (existingRoundIndex >= 0) {
            updatedRounds[existingRoundIndex] = savedData;
          } else {
            updatedRounds.push(savedData);
          }
          
          return { ...c, rounds: updatedRounds };
        }
        return c;
      })
    );
  };

  // Schedule interview handler (opens mailto) - handled directly in KanbanCard
  const handleScheduleInterview = (_candidate: KanbanCandidate) => {};

  return (
    <div className="h-full flex flex-col">
      {/* Header with job filter */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Job:</label>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none min-w-[200px]"
          >
            <option value="all">All Jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>

        {isUpdating && (
          <span className="text-sm text-gray-500 flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
            Updating...
          </span>
        )}
      </div>

      {/* Kanban columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1 min-h-0">
          {/* Regular columns */}
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              candidates={groupedCandidates[column.id as keyof typeof groupedCandidates] || []}
              color={column.color}
              showJobTitle={selectedJob === "all"}
              onAddNotes={handleAddNotes}
              onScheduleInterview={handleScheduleInterview}
            />
          ))}

          {/* Final column with selected/rejected */}
          <FinalColumn
            selectedCandidates={groupedCandidates.selected}
            rejectedCandidates={groupedCandidates.rejected}
            showJobTitle={selectedJob === "all"}
            onAddNotes={handleAddNotes}
            onScheduleInterview={handleScheduleInterview}
          />
        </div>
      </DragDropContext>

      {/* Notes dialog */}
      <RoundNotesDialog
        isOpen={notesDialog.isOpen}
        onClose={() => setNotesDialog((prev) => ({ ...prev, isOpen: false }))}
        candidateId={notesDialog.candidateId}
        candidateName={notesDialog.candidateName}
        round={notesDialog.round}
        existingData={notesDialog.existingData}
        onSave={handleNotesSave}
      />
    </div>
  );
}
