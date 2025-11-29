"use client";

import { useState } from "react";
import { X, Star, FileText, Calendar, User, Mail, Briefcase, Phone, Link2, Github, Linkedin, ChevronDown, ChevronUp, ArrowRight, XCircle } from "lucide-react";
import { KanbanCandidate, CandidateRound } from "./kanban-types";

interface CandidateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: KanbanCandidate | null;
  onAddNotes: (candidateId: string, round: string) => void;
  onMoveToNextRound?: (candidateId: string, currentRound: string) => void;
  onReject?: (candidateId: string) => void;
  scheduledInterviews?: Record<string, boolean>; // Track which rounds have been scheduled
  onScheduleInterview?: (candidateId: string, round: string) => void;
  initialTab?: "overview" | "rounds";
  initialShowAllDetails?: boolean;
}

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  applied: { label: "Applied", color: "text-blue-700", bg: "bg-blue-100" },
  round_1: { label: "Round 1", color: "text-yellow-700", bg: "bg-yellow-100" },
  round_2: { label: "Round 2", color: "text-orange-700", bg: "bg-orange-100" },
  round_3: { label: "Round 3", color: "text-purple-700", bg: "bg-purple-100" },
  selected: { label: "Selected", color: "text-green-700", bg: "bg-green-100" },
  rejected: { label: "Rejected", color: "text-red-700", bg: "bg-red-100" },
};

const roundOrder = ["round_1", "round_2", "round_3"];

// Modal showing full candidate details with interview history
export default function CandidateDetailModal({
  isOpen,
  onClose,
  candidate,
  onAddNotes,
  onMoveToNextRound,
  onReject,
  scheduledInterviews = {},
  onScheduleInterview,
  initialTab = "overview",
  initialShowAllDetails = false,
}: CandidateDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "rounds">(initialTab);
  const [showAllDetails, setShowAllDetails] = useState(initialShowAllDetails);
  const [lastCandidateId, setLastCandidateId] = useState<string | null>(null);

  // Reset state when candidate changes
  if (candidate && candidate.id !== lastCandidateId) {
    setLastCandidateId(candidate.id);
    setActiveTab(initialTab);
    setShowAllDetails(initialShowAllDetails);
  }

  // When switching to overview tab, collapse all details
  const handleTabChange = (tab: "overview" | "rounds") => {
    setActiveTab(tab);
    if (tab === "overview") {
      setShowAllDetails(false);
    }
  };

  if (!isOpen || !candidate) return null;

  const statusConfig = statusLabels[candidate.status] || { label: candidate.status, color: "text-gray-700", bg: "bg-gray-100" };

  // Get all rounds sorted in order
  const sortedRounds = roundOrder
    .map((round) => candidate.rounds?.find((r) => r.round === round))
    .filter((r): r is CandidateRound => r !== undefined);

  // Check which rounds the candidate has passed through based on current status
  const statusIndex = roundOrder.indexOf(candidate.status);
  
  // For rejected/selected candidates, determine passed rounds from actual round data
  // A round is "passed" if the candidate has round data for it
  const roundsWithData = sortedRounds.map(r => r.round);
  
  // Calculate passed rounds correctly
  const getPassedRounds = () => {
    if (candidate.status === "selected") {
      // Selected means they passed all rounds
      return roundOrder;
    } else if (candidate.status === "rejected") {
      // Rejected - only show rounds they actually have data for as passed
      // But the round they were rejected AT should not be shown as passed
      return roundsWithData.slice(0, -1); // All rounds except the last one (where they were rejected)
    } else if (statusIndex >= 0) {
      // Still in process - show all rounds up to and including current
      return roundOrder.slice(0, statusIndex + 1);
    }
    return [];
  };
  
  const passedRounds = getPassedRounds();

  // Format date nicely
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "Not scheduled";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Generate mailto link for interview
  const getMailtoLink = (round: string) => {
    const roundLabel = round.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
    const subject = encodeURIComponent(`Interview Invitation - ${candidate.job.title} at Rumik.ai`);
    const body = encodeURIComponent(
      `Hi ${candidate.name},\n\n` +
      `Congratulations! You've progressed to ${roundLabel} for the ${candidate.job.title} position at Rumik.ai.\n\n` +
      `We'd like to schedule an interview with you. Please reply with your availability for the coming week.\n\n` +
      `Best regards,\nRumik.ai Hiring Team`
    );
    return `mailto:${candidate.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-1.5">
              <h2 className="text-lg font-semibold text-gray-900 truncate">{candidate.name}</h2>
              {candidate.resumeUrl && (
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gray-100 hover:bg-gray-300 rounded-md transition-colors shrink-0"
                >
                  <FileText size={14} />
                  Resume
                </a>
                
              )}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusConfig.bg} ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Briefcase size={12} />
                {candidate.job.title}
              </span>
              <span className="flex items-center gap-1 truncate">
                <Mail size={12} />
                {candidate.email}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors ml-2">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 shrink-0">
          <button
            onClick={() => handleTabChange("overview")}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "overview"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => handleTabChange("rounds")}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "rounds"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Interview Rounds
            {sortedRounds.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                {sortedRounds.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {activeTab === "overview" ? (
            <div className="space-y-4">
              {/* All Details - Collapsible */}
              <div className="bg-gray-50 rounded-lg">
                <button
                  onClick={() => setShowAllDetails(!showAllDetails)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span>All Details</span>
                  {showAllDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                
                {showAllDetails && (
                  <div className="px-4 pb-4 space-y-3">
                    {/* Contact & Links */}
                    <div className="grid grid-cols-2 gap-2.5 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={14} className="shrink-0" />
                        <a href={`mailto:${candidate.email}`} className="text-blue-600 hover:underline truncate">
                          {candidate.email}
                        </a>
                      </div>
                      {candidate.contact && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={14} className="shrink-0" />
                          <span>{candidate.contact}</span>
                        </div>
                      )}
                      {candidate.linkedin && (
                        <a
                          href={candidate.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:underline"
                        >
                          <Linkedin size={14} className="shrink-0" />
                          LinkedIn
                        </a>
                      )}
                      {candidate.github && (
                        <a
                          href={candidate.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:underline"
                        >
                          <Github size={14} className="shrink-0" />
                          GitHub
                        </a>
                      )}
                      {candidate.portfolio && (
                        <a
                          href={candidate.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:underline"
                        >
                          <Link2 size={14} className="shrink-0" />
                          Portfolio
                        </a>
                      )}
                    </div>

                    {/* Why This Role */}
                    {candidate.whyFit && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-1.5">Why This Role?</p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{candidate.whyFit}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Interview Progress */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Interview Progress</h3>
                <div className="flex items-center gap-2">
                  {roundOrder.map((round, idx) => {
                    const isPassed = passedRounds.includes(round);
                    const isCurrent = candidate.status === round;
                    // For rejected candidates, highlight the round where they were rejected
                    const isRejectedAt = candidate.status === "rejected" && 
                      roundsWithData.length > 0 && 
                      roundsWithData[roundsWithData.length - 1] === round;
                    
                    return (
                      <div key={round} className="flex items-center gap-2">
                        <div
                          className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-colors ${
                            isRejectedAt
                              ? "bg-red-100 text-red-700"
                              : isCurrent
                              ? "bg-black text-white"
                              : isPassed
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {isRejectedAt ? "✗" : idx + 1}
                        </div>
                        {idx < roundOrder.length - 1 && (
                          <div className={`w-7 h-0.5 ${isPassed && !isCurrent && !isRejectedAt ? "bg-green-300" : "bg-gray-200"}`} />
                        )}
                      </div>
                    );
                  })}
                  {/* Final status */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-0.5 bg-gray-200" />
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${
                        candidate.status === "selected"
                          ? "bg-green-500 text-white"
                          : candidate.status === "rejected"
                          ? "bg-red-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {candidate.status === "selected" ? "✓" : candidate.status === "rejected" ? "✗" : "?"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  {roundOrder.map((round, idx) => (
                    <div key={round} className="flex items-center gap-2">
                      <span className="w-7 text-center">R{idx + 1}</span>
                      {idx < roundOrder.length - 1 && <span className="w-7" />}
                    </div>
                  ))}
                  <span className="w-7" />
                  <span className="w-7 text-center">End</span>
                </div>
              </div>

              {/* Round Summary */}
              {sortedRounds.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Round Summary</h3>
                  <div className="space-y-2.5">
                    {sortedRounds.map((round) => (
                      <div key={round.round} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-medium text-gray-700">
                            {round.round.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                          {round.rating && (
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={12}
                                  className={star <= round.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-gray-500">
                          {round.interviewer && (
                            <span className="flex items-center gap-1">
                              <User size={12} />
                              {round.interviewer}
                            </span>
                          )}
                          {round.interviewDate && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDate(round.interviewDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {roundOrder.map((round) => {
                const roundData = candidate.rounds?.find((r) => r.round === round);
                const isPassed = passedRounds.includes(round) || ["selected", "rejected"].includes(candidate.status);
                const isCurrent = candidate.status === round;
                const roundLabel = round.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

                return (
                  <div
                    key={round}
                    className={`rounded-lg border ${
                      isCurrent
                        ? "border-black bg-gray-50"
                        : roundData
                        ? "border-gray-200 bg-white"
                        : "border-gray-100 bg-gray-50/50"
                    }`}
                  >
                    {/* Round Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            isCurrent
                              ? "bg-black text-white"
                              : isPassed && roundData
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {round.split("_")[1]}
                        </span>
                        <span className="font-medium text-sm text-gray-900">{roundLabel}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-black text-white text-xs rounded">Current</span>
                        )}
                      </div>
                      {(isCurrent || isPassed) && (
                        <button
                          onClick={() => onAddNotes(candidate.id, round)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {roundData ? "Edit Notes" : "Add Notes"}
                        </button>
                      )}
                    </div>

                    {/* Round Content */}
                    {roundData ? (
                      <div className="px-4 py-3 space-y-2.5">
                        {/* Rating */}
                        {roundData.rating && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Rating:</span>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={14}
                                  className={star <= roundData.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Interviewer & Date */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          {roundData.interviewer && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <User size={14} />
                              <span>{roundData.interviewer}</span>
                            </div>
                          )}
                          {roundData.interviewDate && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Calendar size={14} />
                              <span>{formatDate(roundData.interviewDate)}</span>
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {roundData.notes && (
                          <div className="pt-2.5 border-t border-gray-100">
                            <p className="text-sm text-gray-600 font-medium mb-1">Notes:</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{roundData.notes}</p>
                          </div>
                        )}

                        {/* Action buttons - show only for current round with notes */}
                        {isCurrent && roundData.notes && (
                          <div className="pt-3 border-t border-gray-100 flex gap-2">
                            {round !== "round_3" && onMoveToNextRound && (
                              <button
                                onClick={() => onMoveToNextRound(candidate.id, round)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors"
                              >
                                <ArrowRight size={14} />
                                Move to Next Round
                              </button>
                            )}
                            {round === "round_3" && onMoveToNextRound && (
                              <button
                                onClick={() => onMoveToNextRound(candidate.id, round)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors"
                              >
                                <ArrowRight size={14} />
                                Select Candidate
                              </button>
                            )}
                            {onReject && (
                              <button
                                onClick={() => onReject(candidate.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors"
                              >
                                <XCircle size={14} />
                                Reject
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (isPassed || isCurrent) ? (
                      <div className="px-4 py-3">
                        {/* Check if interview is scheduled for this round */}
                        {scheduledInterviews[`${candidate.id}-${round}`] ? (
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">Interview scheduled - awaiting notes</p>
                            <button
                              onClick={() => onAddNotes(candidate.id, round)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-black text-white hover:bg-gray-800 rounded-md transition-colors"
                            >
                              Add Notes
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">No interview scheduled yet</p>
                            <a
                              href={getMailtoLink(round)}
                              onClick={() => onScheduleInterview?.(candidate.id, round)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
                            >
                              <Mail size={14} />
                              Schedule Interview
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="px-4 py-3">
                        <p className="text-sm text-gray-400 italic">Not yet reached</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
