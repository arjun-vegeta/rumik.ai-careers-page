"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Star, FileText, Calendar, Mail, ArrowRight, XCircle, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { KanbanCandidate } from "./kanban-types";

interface KanbanCardProps {
    candidate: KanbanCandidate;
    index: number;
    showJobTitle: boolean;
    onAddNotes: (candidateId: string, round: string) => void;
    onCardClick: (candidateId: string) => void;
    onMoveToNextRound?: (candidateId: string, currentRound: string) => void;
    onReject?: (candidateId: string) => void;
    isScheduled?: boolean;
    onScheduleInterview?: (candidateId: string, round: string) => void;
    isEmailSent?: boolean;
    onEmailSent?: (candidateId: string) => void;
}

// Draggable card representing a candidate in the Kanban board
export default function KanbanCard({
    candidate,
    index,
    showJobTitle,
    onAddNotes,
    onCardClick,
    onMoveToNextRound,
    onReject,
    isScheduled = false,
    onScheduleInterview,
    isEmailSent = false,
    onEmailSent,
}: KanbanCardProps) {
    const [showHoverTooltip, setShowHoverTooltip] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Handle hover tooltip with 2 second delay
    const handleMouseEnter = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setShowHoverTooltip(true);
        }, 500);
    };

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        setShowHoverTooltip(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        // Hide tooltip when hovering over buttons or links
        if (target.closest('button') || target.closest('a')) {
            setShowHoverTooltip(false);
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
            }
        } else {
            // Restart tooltip timer if not over interactive elements and tooltip not showing
            if (!showHoverTooltip && !hoverTimeoutRef.current) {
                hoverTimeoutRef.current = setTimeout(() => {
                    setShowHoverTooltip(true);
                }, 500);
            }
        }
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    // Get round data for current status
    const currentRound = candidate.rounds?.find(
        (r) => r.round === candidate.status
    );

    // Check if candidate is in an interview round
    const isInRound = ["round_1", "round_2", "round_3"].includes(candidate.status);

    // Check if candidate is in final status
    const isSelected = candidate.status === "selected";
    const isRejected = candidate.status === "rejected";

    // Check if notes exist for current round
    const hasNotes = !!currentRound?.notes;

    // Generate mailto link for offer email
    const getOfferMailtoLink = () => {
        const subject = encodeURIComponent(`Congratulations! You've Been Selected - ${candidate.job.title} at Rumik.ai`);
        const body = encodeURIComponent(
            `Dear ${candidate.name},\n\n` +
            `We are thrilled to inform you that after careful consideration, you have been selected for the ${candidate.job.title} position at Rumik.ai!\n\n` +
            `Your skills, experience, and enthusiasm throughout the interview process truly impressed our team. We believe you will be a valuable addition to Rumik.ai.\n\n` +
            `Next Steps:\n` +
            `1. Our HR team will reach out to you within the next 2-3 business days with the offer letter and compensation details.\n` +
            `2. Please feel free to reach out if you have any questions in the meantime.\n\n` +
            `We are excited to welcome you aboard and look forward to working with you!\n\n` +
            `Best regards,\nRumik.ai Hiring Team`
        );
        return `mailto:${candidate.email}?subject=${subject}&body=${body}`;
    };

    // Generate mailto link for rejection email
    const getRejectionMailtoLink = () => {
        const subject = encodeURIComponent(`Update on Your Application - ${candidate.job.title} at Rumik.ai`);
        const body = encodeURIComponent(
            `Dear ${candidate.name},\n\n` +
            `Thank you for taking the time to apply for the ${candidate.job.title} position at Rumik.ai and for your interest in joining our team.\n\n` +
            `After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs. This was a difficult decision, as we received many impressive applications.\n\n` +
            `We truly appreciate the time and effort you invested in the interview process. Your skills and experience are commendable, and we encourage you to apply for future openings that match your profile.\n\n` +
            `We wish you all the best in your career endeavors.\n\n` +
            `Warm regards,\nRumik.ai Hiring Team`
        );
        return `mailto:${candidate.email}?subject=${subject}&body=${body}`;
    };

    // Generate mailto link for interview
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

    // Format interview date nicely
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    // Handle card body click
    const handleCardBodyClick = (e: React.MouseEvent) => {
        // Don't trigger if clicking on menu or other interactive elements
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('a')) {
            return;
        }
        onCardClick(candidate.id);
    };

    return (
        <Draggable draggableId={candidate.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={handleCardBodyClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                    className={`relative bg-white rounded-lg border p-2 mb-1.5 shadow-sm transition-shadow cursor-pointer ${
                        snapshot.isDragging
                            ? "shadow-lg border-gray-400"
                            : "border-gray-200 hover:shadow-md hover:border-gray-300"
                    }`}
                >
                    {/* Hover tooltip - appears after 2 seconds, follows cursor */}
                    {showHoverTooltip && !snapshot.isDragging && (
                        <div 
                            className="fixed z-[9999] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
                            style={{ 
                                left: mousePos.x + 12, 
                                top: mousePos.y + 12 
                            }}
                        >
                            <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                Click to view details
                            </div>
                        </div>
                    )}
                    
                    {/* Header with name */}
                    <div className="mb-0.5">
                        <h4 className="font-medium text-gray-900 text-xs truncate leading-tight">
                            {candidate.name}
                        </h4>
                    </div>

                    {/* Job title (shown when filter is "All Jobs") */}
                    {showJobTitle && (
                        <p className="text-[10px] text-gray-500 mb-1 truncate leading-tight">
                            {candidate.job.title}
                        </p>
                    )}

                    {/* Indicators row */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Rating stars */}
                        {currentRound?.rating && (
                            <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={10}
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
                            <div className="flex items-center gap-0.5 text-gray-500" title="Has notes">
                                <FileText size={10} />
                            </div>
                        )}

                        {/* Interview date */}
                        {currentRound?.interviewDate && (
                            <div className="flex items-center gap-0.5 text-[10px] text-blue-600" title="Interview scheduled">
                                <Calendar size={10} />
                                <span>{formatDate(currentRound.interviewDate)}</span>
                            </div>
                        )}
                    </div>

                    {/* Action buttons for rounds */}
                    {isInRound && (
                        <div className="mt-2">
                            {hasNotes ? (
                                // Notes added - show move/reject buttons
                                <div className="flex gap-1.5">
                                    {onMoveToNextRound && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onMoveToNextRound(candidate.id, candidate.status);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-[10px] font-medium bg-green-600 text-white hover:bg-green-700 rounded transition-colors"
                                        >
                                            <ArrowRight size={10} />
                                            {candidate.status === "round_3" ? "Select" : "Next"}
                                        </button>
                                    )}
                                    {onReject && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onReject(candidate.id);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-[10px] font-medium bg-red-600 text-white hover:bg-red-700 rounded transition-colors"
                                        >
                                            <XCircle size={10} />
                                            Reject
                                        </button>
                                    )}
                                </div>
                            ) : isScheduled ? (
                                // Interview scheduled - show add notes button
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddNotes(candidate.id, candidate.status);
                                    }}
                                    className="w-full flex items-center justify-center gap-1 px-2 py-2 text-[10px] font-medium bg-black text-white hover:bg-gray-800 rounded transition-colors"
                                >
                                    <FileText size={10} />
                                    Add Notes
                                </button>
                            ) : (
                                // No interview scheduled - show schedule button
                                <a
                                    href={getMailtoLink()}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onScheduleInterview?.(candidate.id, candidate.status);
                                    }}
                                    className="w-full flex items-center justify-center gap-1 px-2 py-2 text-[10px] font-medium bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
                                >
                                    <Mail size={10} />
                                    Schedule Interview
                                </a>
                            )}
                        </div>
                    )}

                    {/* Email button for selected candidates */}
                    {isSelected && (
                        <div className="mt-2">
                            {isEmailSent ? (
                                <div className="w-full flex items-center justify-center gap-1 px-2 py-2 text-[10px] font-medium bg-green-100 text-green-700 rounded">
                                    <Check size={10} />
                                    Offer Email Sent
                                </div>
                            ) : (
                                <a
                                    href={getOfferMailtoLink()}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEmailSent?.(candidate.id);
                                    }}
                                    className="w-full flex items-center justify-center gap-1 px-2 py-2 text-[10px] font-medium bg-green-600 text-white hover:bg-green-700 rounded transition-colors"
                                >
                                    <Mail size={10} />
                                    Send Offer Email
                                </a>
                            )}
                        </div>
                    )}

                    {/* Email button for rejected candidates */}
                    {isRejected && (
                        <div className="mt-2">
                            {isEmailSent ? (
                                <div className="w-full flex items-center justify-center gap-1 px-2 py-2 text-[10px] font-medium bg-red-100 text-red-700 rounded">
                                    <Check size={10} />
                                    Rejection Email Sent
                                </div>
                            ) : (
                                <a
                                    href={getRejectionMailtoLink()}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEmailSent?.(candidate.id);
                                    }}
                                    className="w-full flex items-center justify-center gap-1 px-2 py-2 text-[10px] font-medium bg-red-600 text-white hover:bg-red-700 rounded transition-colors"
                                >
                                    <Mail size={10} />
                                    Send Rejection Email
                                </a>
                            )}
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
}
