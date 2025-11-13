"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, ChevronUp, Sparkles, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

interface AIInsight {
  score: number;
  insights: string[];
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  contact: string;
  whyFit: string;
  portfolio: string | null;
  linkedin: string | null;
  github: string | null;
  resumeUrl: string;
  status: string;
  createdAt: Date;
  job: {
    title: string;
  };
  aiInsights: AIInsight[];
}

interface AllCandidatesClientProps {
  candidates: Candidate[];
  allJobs: string[];
}

export default function AllCandidatesClient({ candidates: initialCandidates, allJobs }: AllCandidatesClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState(initialCandidates);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [generatingInsights, setGeneratingInsights] = useState<string | null>(null);

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch = searchQuery === "" ||
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.job.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesJob = selectedJob === "all" || candidate.job.title === selectedJob;
    
    return matchesSearch && matchesJob;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    setUpdatingStatus(candidateId);
    try {
      const res = await fetch(`/api/candidates/${candidateId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setCandidates(candidates.map(c => 
        c.id === candidateId ? { ...c, status: newStatus } : c
      ));
      
      router.refresh();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const generateAIInsights = async (candidateId: string) => {
    setGeneratingInsights(candidateId);
    try {
      const res = await fetch(`/api/candidates/${candidateId}/ai-insights`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate AI insights");
      }

      setCandidates(candidates.map(c => 
        c.id === candidateId ? { ...c, aiInsights: [data] } : c
      ));
      
      router.refresh();
    } catch (error: any) {
      console.error("Error generating AI insights:", error);
      alert(`Failed to generate AI insights: ${error.message}`);
    } finally {
      setGeneratingInsights(null);
    }
  };

  return (
    <div>
      {/* Search Bar and Job Filter */}
      <div className="mb-4 md:mb-6 flex flex-col md:flex-row gap-3 md:gap-4">
        <div className="relative flex-1 md:max-w-2xl">
          <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
          />
        </div>
        <Select value={selectedJob} onValueChange={setSelectedJob}>
          <SelectTrigger className="w-full md:w-[250px] border py-2.5 md:py-6 h-auto bg-white text-sm md:text-base">
            <SelectValue placeholder="Filter by job" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            {allJobs.map((jobTitle) => (
              <SelectItem key={jobTitle} value={jobTitle}>
                {jobTitle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Job Title</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Submitted</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Resume</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  {selectedJob !== "all" ? "No applicants yet for this job." : "No applicants found."}
                </td>
              </tr>
            ) : (
              filteredCandidates.map((candidate) => (
                <React.Fragment key={candidate.id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{candidate.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{candidate.job.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {new Date(candidate.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Select
                        value={candidate.status}
                        onValueChange={(value) => handleStatusChange(candidate.id, value)}
                        disabled={updatingStatus === candidate.id}
                      >
                        <SelectTrigger 
                          className={`w-[140px] h-8 text-xs font-medium ${
                            candidate.status === "submitted" 
                              ? "bg-blue-50 text-blue-800 border-blue-200" 
                              : candidate.status === "in_review"
                              ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                              : candidate.status === "selected"
                              ? "bg-green-50 text-green-800 border-green-200"
                              : candidate.status === "rejected"
                              ? "bg-red-50 text-red-800 border-red-200"
                              : ""
                          }`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="submitted" className="text-blue-800">Submitted</SelectItem>
                          <SelectItem value="in_review" className="text-yellow-800">In Review</SelectItem>
                          <SelectItem value="selected" className="text-green-800">Selected</SelectItem>
                          <SelectItem value="rejected" className="text-red-800">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={candidate.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          Resume
                        </Button>
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => toggleExpand(candidate.id)}
                          className="flex items-center gap-1 bg-black text-[#E5E0CD] hover:bg-[#E5E0CD] hover:border-2 hover:border-black hover:text-black transition-all duration-300 border-2 border-black"
                        >
                          Details
                          {expandedId === candidate.id ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === candidate.id && (
                    <tr>
                      <td colSpan={7} className="px-6 py-6 bg-gray-50">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Left Column - Candidate Info */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">Contact Information</h4>
                              <p className="text-sm text-gray-700">Phone: {candidate.contact}</p>
                            </div>

                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">Why This Role?</h4>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{candidate.whyFit}</p>
                            </div>

                            {(candidate.portfolio || candidate.linkedin || candidate.github) && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Links</h4>
                                <div className="flex gap-4 text-sm">
                                  {candidate.portfolio && (
                                    <a
                                      href={candidate.portfolio}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      Portfolio ↗
                                    </a>
                                  )}
                                  {candidate.linkedin && (
                                    <a
                                      href={candidate.linkedin}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      LinkedIn ↗
                                    </a>
                                  )}
                                  {candidate.github && (
                                    <a
                                      href={candidate.github}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      GitHub ↗
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right Column - AI Insights */}
                          <div className="bg-white rounded-lg p-5 border border-gray-200">
                            {candidate.aiInsights && candidate.aiInsights.length > 0 ? (
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <Sparkles className="text-[#E5E0CD]" size={18} />
                                  <h4 className="text-sm font-semibold text-gray-900">AI Insights</h4>
                                </div>

                                <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                                  <div className="text-4xl font-bold text-gray-900">
                                    {candidate.aiInsights[0].score}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Match Score</div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-black h-2 rounded-full transition-all"
                                        style={{ width: `${candidate.aiInsights[0].score}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3 mt-4">
                                  <div className="text-xs font-semibold text-gray-700 uppercase">Key Insights</div>
                                  {candidate.aiInsights[0].insights.map((insight, idx) => (
                                    <div key={idx} className="flex gap-3">
                                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-black text-[#E5E0CD] text-xs font-bold flex items-center justify-center mt-0.5">
                                        {idx + 1}
                                      </span>
                                      <span className="text-sm text-gray-700 leading-relaxed">{insight}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                {generatingInsights === candidate.id ? (
                                  <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="animate-spin text-gray-900" size={32} />
                                    <p className="text-sm text-gray-700 font-medium">Analyzing candidate...</p>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-4">
                                    <Sparkles className="text-gray-400" size={32} />
                                    <div>
                                      <h5 className="text-sm font-semibold text-gray-900 mb-1">AI Analysis</h5>
                                      <p className="text-xs text-gray-600 mb-4">Get insights on candidate fit</p>
                                    </div>
                                    <Button
                                      onClick={() => generateAIInsights(candidate.id)}
                                      className="bg-black text-[#E5E0CD] hover:bg-[#E5E0CD] hover:border-2 hover:border-black hover:text-black transition-all duration-300 border-2 border-black"
                                    >
                                      <Sparkles className="mr-2" size={16} />
                                      Generate Insights
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredCandidates.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            {selectedJob !== "all" ? "No applicants yet for this job." : "No applicants found."}
          </div>
        ) : (
          filteredCandidates.map((candidate) => {
            const isExpanded = expandedId === candidate.id;
            return (
              <div key={candidate.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900">{candidate.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{candidate.email}</p>
                    <p className="text-xs text-gray-500 mt-1">{candidate.job.title}</p>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  Applied: {new Date(candidate.createdAt).toLocaleDateString()}
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <Select
                    value={candidate.status}
                    onValueChange={(value) => handleStatusChange(candidate.id, value)}
                    disabled={updatingStatus === candidate.id}
                  >
                    <SelectTrigger 
                      className={`w-full h-9 text-xs font-medium ${
                        candidate.status === "submitted" 
                          ? "bg-blue-50 text-blue-800 border-blue-200" 
                          : candidate.status === "in_review"
                          ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                          : candidate.status === "selected"
                          ? "bg-green-50 text-green-800 border-green-200"
                          : candidate.status === "rejected"
                          ? "bg-red-50 text-red-800 border-red-200"
                          : ""
                      }`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="submitted" className="text-blue-800">Submitted</SelectItem>
                      <SelectItem value="in_review" className="text-yellow-800">In Review</SelectItem>
                      <SelectItem value="selected" className="text-green-800">Selected</SelectItem>
                      <SelectItem value="rejected" className="text-red-800">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <a
                    href={candidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      View Resume
                    </Button>
                  </a>
                  <Button
                    size="sm"
                    onClick={() => toggleExpand(candidate.id)}
                    className="flex items-center gap-1 bg-black text-[#E5E0CD] hover:bg-[#E5E0CD] hover:border-2 hover:border-black hover:text-black transition-all duration-300 border-2 border-black text-xs"
                  >
                    Details
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </Button>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    {/* Contact Info */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900 mb-1">Contact Information</h4>
                      <p className="text-xs text-gray-700">Phone: {candidate.contact}</p>
                    </div>

                    {/* Why This Role */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900 mb-1">Why This Role?</h4>
                      <p className="text-xs text-gray-700 whitespace-pre-wrap">{candidate.whyFit}</p>
                    </div>

                    {/* Links */}
                    {(candidate.portfolio || candidate.linkedin || candidate.github) && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900 mb-1">Links</h4>
                        <div className="flex flex-wrap gap-3 text-xs">
                          {candidate.portfolio && (
                            <a
                              href={candidate.portfolio}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Portfolio ↗
                            </a>
                          )}
                          {candidate.linkedin && (
                            <a
                              href={candidate.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              LinkedIn ↗
                            </a>
                          )}
                          {candidate.github && (
                            <a
                              href={candidate.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              GitHub ↗
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* AI Insights */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      {candidate.aiInsights && candidate.aiInsights.length > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="text-[#E5E0CD]" size={16} />
                            <h4 className="text-xs font-semibold text-gray-900">AI Insights</h4>
                          </div>

                          <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                            <div className="text-2xl font-bold text-gray-900">
                              {candidate.aiInsights[0].score}
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-medium text-gray-700 mb-1">Match Score</div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-black h-1.5 rounded-full transition-all"
                                  style={{ width: `${candidate.aiInsights[0].score}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-gray-700 uppercase">Key Insights</div>
                            {candidate.aiInsights[0].insights.map((insight, idx) => (
                              <div key={idx} className="flex gap-2">
                                <span className="shrink-0 w-5 h-5 rounded-full bg-black text-[#E5E0CD] text-xs font-bold flex items-center justify-center mt-0.5">
                                  {idx + 1}
                                </span>
                                <span className="text-xs text-gray-700 leading-relaxed">{insight}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          {generatingInsights === candidate.id ? (
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="animate-spin text-gray-900" size={24} />
                              <p className="text-xs text-gray-700 font-medium">Analyzing candidate...</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              <Sparkles className="text-gray-400" size={24} />
                              <div>
                                <h5 className="text-xs font-semibold text-gray-900 mb-1">AI Analysis</h5>
                                <p className="text-xs text-gray-600 mb-3">Get insights on candidate fit</p>
                              </div>
                              <Button
                                onClick={() => generateAIInsights(candidate.id)}
                                size="sm"
                                className="bg-black text-[#E5E0CD] hover:bg-[#E5E0CD] hover:border-2 hover:border-black hover:text-black transition-all duration-300 border-2 border-black text-xs"
                              >
                                <Sparkles className="mr-1" size={14} />
                                Generate Insights
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
