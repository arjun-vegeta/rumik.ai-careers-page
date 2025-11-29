"use client";

import { Droppable } from "@hello-pangea/dnd";
import KanbanCard from "./KanbanCard";
import { KanbanCandidate } from "./kanban-types";

interface KanbanColumnProps {
  id: string;
  title: string;
  candidates: KanbanCandidate[];
  color: string;
  showJobTitle: boolean;
  onAddNotes: (candidateId: string, round: string) => void;
  onScheduleInterview: (candidate: KanbanCandidate) => void;
}

// A single column in the Kanban board that accepts draggable cards
export default function KanbanColumn({
  id,
  title,
  candidates,
  color,
  showJobTitle,
  onAddNotes,
  onScheduleInterview,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col bg-gray-50 rounded-xl min-w-[260px] max-w-[280px] h-full">
      {/* Column header */}
      <div className={`px-3 py-3 rounded-t-xl ${color}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-800">{title}</h3>
          <span className="bg-white/80 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
            {candidates.length}
          </span>
        </div>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 overflow-y-auto min-h-[200px] transition-colors ${
              snapshot.isDraggingOver ? "bg-gray-100" : ""
            }`}
          >
            {candidates.map((candidate, index) => (
              <KanbanCard
                key={candidate.id}
                candidate={candidate}
                index={index}
                showJobTitle={showJobTitle}
                onAddNotes={onAddNotes}
                onScheduleInterview={onScheduleInterview}
              />
            ))}
            {provided.placeholder}

            {/* Empty state */}
            {candidates.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-center text-gray-400 text-sm py-8">
                No candidates
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
