"use client";

import { useState, useMemo } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import KanbanColumn from "./KanbanColumn";
import FinalColumn from "./FinalColumn";
import RoundNotesDialog from "./RoundNotesDialog";
import CandidateDetailModal from "./CandidateDetailModal";
import { CandidateRound, KanbanCandidate, Job } from "./kanban-types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Candidate detail modal state
  const [selectedCandidate, setSelectedCandidate] = useState<KanbanCandidate | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });

  // Selection confirmation dialog state
  const [confirmSelect, setConfirmSelect] = useState<{
    isOpen: boolean;
    candidateId: string;
    candidateName: string;
    sourceStatus: string;
  }>({ isOpen: false, candidateId: "", candidateName: "", sourceStatus: "" });

  // Show toast notification
  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 2500);
  };

  // Notes dialog state
  const [notesDialog, setNotesDialog] = useState<{
    isOpen: boolean;
    candidateId: string;
    candidateName: string;
    round: string;
    existingData: CandidateRound | null;
    allRounds: CandidateRound[];
  }>({
    isOpen: false,
    candidateId: "",
    candidateName: "",
    round: "",
    existingData: null,
    allRounds: [],
  });

  // Filter candidates by selected job and search query
  const filteredCandidates = candidates.filter((c) => {
    const matchesJob = selectedJob === "all" || c.job.id === selectedJob;
    const matchesSearch = searchQuery === "" || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesJob && matchesSearch;
  });

  // Group candidates by status
  const groupedCandidates = {
    applied: filteredCandidates.filter((c) => c.status === "applied"),
    round_1: filteredCandidates.filter((c) => c.status === "round_1"),
    round_2: filteredCandidates.filter((c) => c.status === "round_2"),
    round_3: filteredCandidates.filter((c) => c.status === "round_3"),
    selected: filteredCandidates.filter((c) => c.status === "selected"),
    rejected: filteredCandidates.filter((c) => c.status === "rejected"),
  };

  // Derive scheduled interviews from candidate round data (rounds with interviewEmailSent = true)
  const scheduledInterviews = useMemo(() => {
    const scheduled: Record<string, boolean> = {};
    candidates.forEach((candidate) => {
      candidate.rounds?.forEach((round) => {
        if (round.interviewEmailSent) {
          scheduled[`${candidate.id}-${round.round}`] = true;
        }
      });
    });
    return scheduled;
  }, [candidates]);

  // Derive sent final emails from candidate data (finalEmailSent = true)
  const sentEmails = useMemo(() => {
    const sent: Record<string, boolean> = {};
    candidates.forEach((candidate) => {
      if (candidate.finalEmailSent) {
        sent[candidate.id] = true;
      }
    });
    return sent;
  }, [candidates]);

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
    const oldStatus = source.droppableId;

    // Define column order for validation (prevent backward movement)
    const columnOrder = ["applied", "round_1", "round_2", "round_3", "selected", "rejected"];
    const oldIndex = columnOrder.indexOf(oldStatus);
    const newIndex = columnOrder.indexOf(newStatus);

    // Prevent moving backwards (except to rejected which is always allowed)
    if (newStatus !== "rejected" && newStatus !== "selected" && newIndex < oldIndex) {
      showToast("Moving candidates backwards is not allowed");
      return;
    }

    // If moving to selected, show confirmation dialog
    if (newStatus === "selected") {
      setConfirmSelect({
        isOpen: true,
        candidateId: draggableId,
        candidateName: candidate.name,
        sourceStatus: oldStatus,
      });
      return;
    }

    // Proceed with the move
    await updateCandidateStatus(draggableId, newStatus, oldStatus);
  };

  // Update candidate status (extracted for reuse)
  const updateCandidateStatus = async (candidateId: string, newStatus: string, oldStatus: string) => {
    // Optimistically update the UI
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
    );

    // Update on the server
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/candidates/${candidateId}/status`, {
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
        prev.map((c) => (c.id === candidateId ? { ...c, status: oldStatus } : c))
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle confirm selection
  const handleConfirmSelection = async () => {
    if (confirmSelect.candidateId) {
      await updateCandidateStatus(confirmSelect.candidateId, "selected", confirmSelect.sourceStatus);
    }
    setConfirmSelect({ isOpen: false, candidateId: "", candidateName: "", sourceStatus: "" });
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
      allRounds: candidate.rounds || [],
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
          
          // Also update selectedCandidate if it's the same candidate
          if (selectedCandidate?.id === notesDialog.candidateId) {
            setSelectedCandidate({ ...selectedCandidate, rounds: updatedRounds });
          }
          
          return { ...c, rounds: updatedRounds };
        }
        return c;
      })
    );
  };

  // Handle card click to open detail modal
  const handleCardClick = (candidateId: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (candidate) {
      setSelectedCandidate(candidate);
    }
  };

  // Handle scheduling an interview (marks email as sent and persists to DB)
  const handleScheduleInterview = async (candidateId: string, round: string) => {
    // Optimistically update UI
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const updatedRounds = c.rounds?.map((r) =>
            r.round === round ? { ...r, interviewEmailSent: true } : r
          ) || [];
          // If round doesn't exist, add it
          if (!updatedRounds.find((r) => r.round === round)) {
            updatedRounds.push({ round, interviewEmailSent: true });
          }
          return { ...c, rounds: updatedRounds };
        }
        return c;
      })
    );

    // Persist to database
    try {
      await fetch(`/api/candidates/${candidateId}/email-sent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "interview", round }),
      });
    } catch (error) {
      console.error("Error saving interview email status:", error);
    }
  };

  // Handle marking final email as sent for selected/rejected candidates
  const handleEmailSent = async (candidateId: string) => {
    // Optimistically update UI
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, finalEmailSent: true } : c))
    );

    // Persist to database
    try {
      await fetch(`/api/candidates/${candidateId}/email-sent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "final" }),
      });
    } catch (error) {
      console.error("Error saving final email status:", error);
    }
  };

  // Handle moving candidate to next round
  const handleMoveToNextRound = async (candidateId: string, currentRound: string) => {
    const roundMap: Record<string, string> = {
      round_1: "round_2",
      round_2: "round_3",
      round_3: "selected",
    };
    const nextStatus = roundMap[currentRound];
    if (!nextStatus) return;

    // Optimistically update the UI
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: nextStatus } : c))
    );

    // Update selectedCandidate if it's the same
    if (selectedCandidate?.id === candidateId) {
      setSelectedCandidate({ ...selectedCandidate, status: nextStatus });
    }

    // Update on the server
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/candidates/${candidateId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      router.refresh();
    } catch (error) {
      console.error("Error updating status:", error);
      // Revert on error
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, status: currentRound } : c))
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle rejecting a candidate
  const handleReject = async (candidateId: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return;

    const previousStatus = candidate.status;

    // Optimistically update the UI
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: "rejected" } : c))
    );

    // Update selectedCandidate if it's the same
    if (selectedCandidate?.id === candidateId) {
      setSelectedCandidate({ ...selectedCandidate, status: "rejected" });
    }

    // Update on the server
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/candidates/${candidateId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      router.refresh();
    } catch (error) {
      console.error("Error rejecting candidate:", error);
      // Revert on error
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, status: previousStatus } : c))
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="h-full flex flex-col min-w-0">
      {/* Header with job filter and search */}
      <div className="flex items-center justify-between mb-4 shrink-0 flex-wrap gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-4xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
            />
          </div>
          <Select value={selectedJob} onValueChange={setSelectedJob}>
            <SelectTrigger className="w-[200px] border py-5 h-auto bg-white text-sm">
              <SelectValue placeholder="Filter by job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        <div className="flex gap-3 pb-4 flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
          {/* Regular columns */}
          {columns.map((column) => (
            <div key={column.id} className="shrink-0 h-full">
              <KanbanColumn
                id={column.id}
                title={column.title}
                candidates={groupedCandidates[column.id as keyof typeof groupedCandidates] || []}
                color={column.color}
                showJobTitle={selectedJob === "all"}
                onAddNotes={handleAddNotes}
                onCardClick={handleCardClick}
                onMoveToNextRound={handleMoveToNextRound}
                onReject={handleReject}
                scheduledInterviews={scheduledInterviews}
                onScheduleInterview={handleScheduleInterview}
              />
            </div>
          ))}

          {/* Final column with selected/rejected */}
          <div className="shrink-0 h-full">
            <FinalColumn
              selectedCandidates={groupedCandidates.selected}
              rejectedCandidates={groupedCandidates.rejected}
              showJobTitle={selectedJob === "all"}
              onAddNotes={handleAddNotes}
              onCardClick={handleCardClick}
              sentEmails={sentEmails}
              onEmailSent={handleEmailSent}
            />
          </div>
        </div>
      </DragDropContext>

      {/* Candidate detail modal */}
      <CandidateDetailModal
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        candidate={selectedCandidate}
        onAddNotes={handleAddNotes}
        onMoveToNextRound={handleMoveToNextRound}
        onReject={handleReject}
        scheduledInterviews={scheduledInterviews}
        onScheduleInterview={handleScheduleInterview}
        initialTab={selectedCandidate?.status === "applied" ? "overview" : "rounds"}
        initialShowAllDetails={selectedCandidate?.status === "applied"}
      />

      {/* Notes dialog */}
      <RoundNotesDialog
        isOpen={notesDialog.isOpen}
        onClose={() => setNotesDialog((prev) => ({ ...prev, isOpen: false }))}
        candidateId={notesDialog.candidateId}
        candidateName={notesDialog.candidateName}
        round={notesDialog.round}
        existingData={notesDialog.existingData}
        allRounds={notesDialog.allRounds}
        onSave={handleNotesSave}
      />

      {/* Selection confirmation dialog */}
      <Dialog open={confirmSelect.isOpen} onOpenChange={(open) => !open && setConfirmSelect({ isOpen: false, candidateId: "", candidateName: "", sourceStatus: "" })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Selection</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark <span className="font-semibold text-gray-900">{confirmSelect.candidateName}</span> as selected? This will move them to the final &quot;Selected&quot; column.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              onClick={() => setConfirmSelect({ isOpen: false, candidateId: "", candidateName: "", sourceStatus: "" })}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSelection}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Yes, Select Candidate
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
