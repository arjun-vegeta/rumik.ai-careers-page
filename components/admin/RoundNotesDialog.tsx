"use client";

import { useState, useEffect } from "react";
import { X, Star, Calendar, User, ChevronDown, ChevronUp } from "lucide-react";

interface RoundData {
  id?: string;
  round: string;
  notes?: string | null;
  rating?: number | null;
  interviewer?: string | null;
  interviewDate?: string | null;
}

interface RoundNotesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName: string;
  round: string;
  existingData?: RoundData | null;
  allRounds?: RoundData[];
  onSave: (data: RoundData) => void;
}

const roundLabels: Record<string, string> = {
  round_1: "Round 1",
  round_2: "Round 2",
  round_3: "Round 3",
};

const roundOrder = ["round_1", "round_2", "round_3"];

// Modal dialog for adding/editing interview round notes and details
export default function RoundNotesDialog({
  isOpen,
  onClose,
  candidateId,
  candidateName,
  round,
  existingData,
  allRounds = [],
  onSave,
}: RoundNotesDialogProps) {
  const [notes, setNotes] = useState(existingData?.notes || "");
  const [rating, setRating] = useState(existingData?.rating || 0);
  const [interviewer, setInterviewer] = useState(existingData?.interviewer || "");
  const [interviewDate, setInterviewDate] = useState(
    existingData?.interviewDate
      ? new Date(existingData.interviewDate).toISOString().slice(0, 16)
      : ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (isOpen) {
      setNotes(existingData?.notes || "");
      setRating(existingData?.rating || 0);
      setInterviewer(existingData?.interviewer || "");
      setInterviewDate(
        existingData?.interviewDate
          ? new Date(existingData.interviewDate).toISOString().slice(0, 16)
          : ""
      );
    }
  }, [isOpen, existingData]);

  if (!isOpen) return null;

  // Get previous rounds (before current round)
  const currentRoundIndex = roundOrder.indexOf(round);
  const previousRounds = allRounds.filter((r) => {
    const rIndex = roundOrder.indexOf(r.round);
    return rIndex >= 0 && rIndex < currentRoundIndex;
  }).sort((a, b) => roundOrder.indexOf(a.round) - roundOrder.indexOf(b.round));

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "Not scheduled";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/candidates/${candidateId}/rounds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          round,
          notes: notes || null,
          rating: rating || null,
          interviewer: interviewer || null,
          interviewDate: interviewDate || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      const savedData = await response.json();
      onSave(savedData);
      onClose();
    } catch (error) {
      console.error("Error saving round notes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {roundLabels[round] || round} Notes
            </h2>
            <p className="text-sm text-gray-500 mt-1">{candidateName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Previous Rounds History */}
          {previousRounds.length > 0 && (
            <div className="mb-5">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 mb-2"
              >
                {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                Previous Rounds ({previousRounds.length})
              </button>
              
              {showHistory && (
                <div className="space-y-3 bg-gray-50 rounded-lg p-3">
                  {previousRounds.map((prevRound) => (
                    <div key={prevRound.round} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-900">
                          {roundLabels[prevRound.round] || prevRound.round}
                        </span>
                        {prevRound.rating && (
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={12}
                                className={star <= prevRound.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        {prevRound.interviewer && (
                          <p className="flex items-center gap-1">
                            <User size={12} /> {prevRound.interviewer}
                          </p>
                        )}
                        {prevRound.interviewDate && (
                          <p className="flex items-center gap-1">
                            <Calendar size={12} /> {formatDate(prevRound.interviewDate)}
                          </p>
                        )}
                        {prevRound.notes && (
                          <p className="text-gray-700 mt-2 whitespace-pre-wrap">{prevRound.notes}</p>
                        )}
                        {!prevRound.notes && !prevRound.rating && !prevRound.interviewer && (
                          <p className="text-gray-400 italic">No notes recorded</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Current Round Form */}
          <div className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      size={24}
                      className={
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <button
                    type="button"
                    onClick={() => setRating(0)}
                    className="ml-2 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Interviewer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User size={14} className="inline mr-1" />
                Interviewer Name
              </label>
              <input
                type="text"
                value={interviewer}
                onChange={(e) => setInterviewer(e.target.value)}
                placeholder="Who conducted the interview?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              />
            </div>

            {/* Interview Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={14} className="inline mr-1" />
                Interview Date & Time
              </label>
              <input
                type="datetime-local"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes & Feedback
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did the candidate perform? Any observations..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-5 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Notes"}
          </button>
        </div>
      </div>
    </div>
  );
}
