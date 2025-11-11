"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import WithdrawButton from "@/components/WithdrawButton";

interface Application {
  id: string;
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

interface ApplicationsClientProps {
  applications: Application[];
}

export default function ApplicationsClient({ applications }: ApplicationsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = searchQuery === "" ||
      app.job.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "submitted":
        return { label: "Submitted", className: "bg-blue-50 text-blue-800 border-blue-200" };
      case "in_review":
        return { label: "In Review", className: "bg-yellow-50 text-yellow-800 border-yellow-200" };
      case "selected":
        return { label: "Selected", className: "bg-green-50 text-green-800 border-green-200" };
      case "rejected":
        return { label: "Rejected", className: "bg-red-50 text-red-800 border-red-200" };
      case "withdrawn":
        return { label: "Withdrawn", className: "bg-gray-50 text-gray-800 border-gray-200" };
      default:
        return { label: status, className: "bg-gray-50 text-gray-800 border-gray-200" };
    }
  };

  return (
    <div>
      {/* Search Bar and Status Filter */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px] border py-6 h-auto bg-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="selected">Selected</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="withdrawn">Withdrawn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Job Title</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Applied</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Resume</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredApplications.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <p className="text-gray-500 mb-4">
                    {applications.length === 0 
                      ? "You haven't applied to any jobs yet." 
                      : "No applications match your filters."}
                  </p>
                  {applications.length === 0 && (
                    <Link href="/roles">
                      <Button className="bg-black text-[#F5E69A] hover:bg-gray-800">
                        Browse Open Positions
                      </Button>
                    </Link>
                  )}
                </td>
              </tr>
            ) : (
              filteredApplications.map((application) => {
                const statusConfig = getStatusConfig(application.status);
                return (
                  <React.Fragment key={application.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{application.job.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {new Date(application.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.className}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={application.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {application.status === "submitted" && (
                            <WithdrawButton applicationId={application.id} />
                          )}
                          <Button
                            size="sm"
                            onClick={() => toggleExpand(application.id)}
                            className="flex items-center gap-1 bg-black text-[#F5E69A] hover:bg-gray-800"
                          >
                            Details
                            {expandedId === application.id ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === application.id && (
                      <tr>
                        <td colSpan={5} className="px-6 py-6 bg-gray-50">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">Why You're a Good Fit</h4>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{application.whyFit}</p>
                            </div>

                            {(application.portfolio || application.linkedin || application.github) && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Links</h4>
                                <div className="flex gap-4 text-sm">
                                  {application.portfolio && (
                                    <a
                                      href={application.portfolio}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      Portfolio ↗
                                    </a>
                                  )}
                                  {application.linkedin && (
                                    <a
                                      href={application.linkedin}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      LinkedIn ↗
                                    </a>
                                  )}
                                  {application.github && (
                                    <a
                                      href={application.github}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
