"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Star, FileText, Calendar, Mail, ExternalLink, MoreVertical } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { KanbanCandidate } from "./kanban-types";

interface KanbanCardProps {
  candidate: KanbanCandidate;
  index: number;
  showJobTitle: boolean;
  onAddNotes: (candidateId: string, round: string) => void;
  onScheduleInterview: (candidate: KanbanCandidate) => void;
}

// Draggable card representing a candidate in the Kanban board
export default function KanbanCard({
  candidate,
  index,
  showJobTitle,
  onAddNotes,
}: KanbanCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Get round data for current status
  const currentRound = candidate.rounds?.find(
    (r) => r.round === candidate.status
  );

  // Check if candidate is in an interview round
  const isInRound = ["round_1", "round_2", "round_3"].includes(candidate.status);

  // Format interview date nicely
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Generate mailto link for scheduling interview
  const getMailtoLink = () => {
    const roundLabel = candidate.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
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
    <Draggable draggableId={candidate.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg border p-3 mb-2 shadow-sm transition-shadow ${
            snapshot.isDragging
              ? "shadow-lg border-gray-400"
              : "border-gray-200 hover:shadow-md"
          }`}
        >
          {/* Header with name and menu */}
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-medium text-gray-900 text-sm truncate flex-1">
              {candidate.name}
            </h4>
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <MoreVertical size={14} className="text-gray-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                  <Link
                    href={`/admin/candidates/${candidate.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <ExternalLink size={14} />
                    View Profile
                  </Link>
                  {isInRound && (
                    <>
                      <button
                        onClick={() => {
                          onAddNotes(candidate.id, candidate.status);
                          setMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <FileText size={14} />
                        Add Notes
                      </button>
                      <a
                        href={getMailtoLink()}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Mail size={14} />
                        Schedule Interview
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Job title (shown when filter is "All Jobs") */}
          {showJobTitle && (
            <p className="text-xs text-gray-500 mb-2 truncate">
              {candidate.job.title}
            </p>
          )}

          {/* Indicators row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Rating stars */}
            {currentRound?.rating && (
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    className={
                      star <= currentRound.rating!
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-200"
                    }
                  />
                ))}
              </div>
            )}

            {/* Notes indicator */}
            {currentRound?.notes && (
              <div className="flex items-center gap-1 text-gray-500" title="Has notes">
                <FileText size={12} />
              </div>
            )}

            {/* Interview date */}
            {currentRound?.interviewDate && (
              <div className="flex items-center gap-1 text-xs text-blue-600" title="Interview scheduled">
                <Calendar size={12} />
                <span>{formatDate(currentRound.interviewDate)}</span>
              </div>
            )}
          </div>

          {/* Quick schedule button for round columns */}
          {isInRound && !currentRound?.interviewDate && (
            <a
              href={getMailtoLink()}
              className="mt-2 flex items-center justify-center gap-1 w-full py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
            >
              <Mail size={12} />
              Schedule Interview
            </a>
          )}
        </div>
      )}
    </Draggable>
  );
}
