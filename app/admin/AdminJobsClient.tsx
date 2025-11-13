"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  jobType: string;
  isActive: boolean;
  _count: {
    candidates: number;
  };
}

interface AdminJobsClientProps {
  jobs: Job[];
}

export default function AdminJobsClient({ jobs }: AdminJobsClientProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "all", label: "All" },
    { id: "engineering", label: "Engineering" },
    { id: "other", label: "Other" },
    { id: "internship", label: "Internships" },
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchesTab = activeTab === "all" || job.jobType === activeTab;
    const matchesSearch =
      searchQuery === "" ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query !== "") {
      setActiveTab("all");
    }
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-4 md:mb-6">
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 md:gap-2 mb-4 md:mb-6 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchQuery("");
            }}
            className={`px-3 md:px-6 py-2 md:py-3 text-sm md:text-base font-medium transition-colors relative cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "text-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
            )}
          </button>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Job Title</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Applicants</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No jobs found.
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{job.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge 
                      variant={job.isActive ? "default" : "secondary"} 
                      className={`text-xs ${job.isActive ? "bg-green-100 text-green-800 border-green-200" : ""}`}
                    >
                      {job.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 font-medium">{job._count.candidates}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/jobs/${job.id}/edit`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <Link href={`/admin/jobs/${job.id}/candidates`}>
                        <Button size="sm" className="bg-black text-[#E5E0CD] hover:bg-[#E5E0CD] hover:border-2 hover:border-black hover:text-black transition-all duration-300 border-2 border-black">
                          View Applicants
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No jobs found.
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-base font-semibold text-gray-900">{job.title}</h3>
                <Badge 
                  variant={job.isActive ? "default" : "secondary"} 
                  className={`text-xs ${job.isActive ? "bg-green-100 text-green-800 border-green-200" : ""}`}
                >
                  {job.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                <span className="font-medium">{job._count.candidates}</span> applicants
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/jobs/${job.id}/edit`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Edit</Button>
                </Link>
                <Link href={`/admin/jobs/${job.id}/candidates`} className="flex-1">
                  <Button size="sm" className="w-full bg-black text-[#E5E0CD] hover:bg-[#E5E0CD] hover:border-2 hover:border-black hover:text-black transition-all duration-300 border-2 border-black">
                    Applicants
                  </Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
