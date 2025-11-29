"use client";

import { useState } from "react";
import { X, Star, Calendar, User } from "lucide-react";

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
  onSave: (data: RoundData) => void;
}

const roundLabels: Record<string, string> = {
  round_1: "Round 1",
  round_2: "Round 2",
  round_3: "Round 3",
};

// Modal dialog for adding/editing interview round notes and details
export default function RoundNotesDialog({
  isOpen,
  onClose,
  candidateId,
  candidateName,
  round,
  existingData,
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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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

        {/* Rating */}
        <div className="mb-4">
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
        <div className="mb-4">
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
        <div className="mb-4">
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
        <div className="mb-6">
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

        {/* Actions */}
        <div className="flex gap-3">
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
