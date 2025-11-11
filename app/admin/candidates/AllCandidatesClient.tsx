"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

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

  return (
    <div>
      {/* Search Bar and Job Filter */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
          />
        </div>
        <Select value={selectedJob} onValueChange={setSelectedJob}>
          <SelectTrigger className="w-[250px] border py-6 h-auto bg-white">
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                          className="flex items-center gap-1 bg-black text-[#F5E69A] hover:bg-gray-800"
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
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
