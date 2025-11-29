"use client";

import { Droppable } from "@hello-pangea/dnd";
import KanbanCard from "./KanbanCard";
import { KanbanCandidate } from "./kanban-types";

interface FinalColumnProps {
  selectedCandidates: KanbanCandidate[];
  rejectedCandidates: KanbanCandidate[];
  showJobTitle: boolean;
  onAddNotes: (candidateId: string, round: string) => void;
  onCardClick: (candidateId: string) => void;
  sentEmails: Record<string, boolean>;
  onEmailSent: (candidateId: string) => void;
}

// Special column that contains both Selected (top) and Rejected (bottom) sections
export default function FinalColumn({
  selectedCandidates,
  rejectedCandidates,
  showJobTitle,
  onAddNotes,
  onCardClick,
  sentEmails,
  onEmailSent,
}: FinalColumnProps) {

  return (
    <div className="flex flex-col bg-gray-100 rounded-xl min-w-[240px] max-w-[260px] h-full">
      {/* Column header */}
      <div className="px-3 py-2.5 rounded-t-xl bg-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-800">Final</h3>
          <span className="bg-white/80 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
            {selectedCandidates.length + rejectedCandidates.length}
          </span>
        </div>
      </div>

      {/* Selected section */}
      <div className="border-b border-gray-200">
        <div className="px-3 py-1.5 bg-green-50 flex items-center justify-between">
          <span className="text-xs font-medium text-green-700 flex items-center gap-1">
            ✓ Selected
          </span>
          <span className="text-xs text-green-600">{selectedCandidates.length}</span>
        </div>
        <Droppable droppableId="selected">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`p-1.5 min-h-[80px] transition-colors ${
                snapshot.isDraggingOver ? "bg-green-50" : ""
              }`}
            >
              {selectedCandidates.map((candidate, index) => (
                <KanbanCard
                  key={candidate.id}
                  candidate={candidate}
                  index={index}
                  showJobTitle={showJobTitle}
                  onAddNotes={onAddNotes}
                  onCardClick={onCardClick}
                  isEmailSent={sentEmails[candidate.id]}
                  onEmailSent={onEmailSent}
                />
              ))}
              {provided.placeholder}

              {selectedCandidates.length === 0 && !snapshot.isDraggingOver && (
                <div className="text-center text-gray-400 text-xs py-4">
                  Drop to select
                </div>
              )}
            </div>
          )}
        </Droppable>
      </div>

      {/* Rejected section */}
      <div className="flex-1">
        <div className="px-3 py-1.5 bg-red-50 flex items-center justify-between">
          <span className="text-xs font-medium text-red-700 flex items-center gap-1">
            ✗ Rejected
          </span>
          <span className="text-xs text-red-600">{rejectedCandidates.length}</span>
        </div>
        <Droppable droppableId="rejected">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`p-1.5 min-h-[80px] transition-colors ${
                snapshot.isDraggingOver ? "bg-red-50" : ""
              }`}
            >
              {rejectedCandidates.map((candidate, index) => (
                <KanbanCard
                  key={candidate.id}
                  candidate={candidate}
                  index={index}
                  showJobTitle={showJobTitle}
                  onAddNotes={onAddNotes}
                  onCardClick={onCardClick}
                  isEmailSent={sentEmails[candidate.id]}
                  onEmailSent={onEmailSent}
                />
              ))}
              {provided.placeholder}

              {rejectedCandidates.length === 0 && !snapshot.isDraggingOver && (
                <div className="text-center text-gray-400 text-xs py-4">
                  Drop to reject
                </div>
              )}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}
