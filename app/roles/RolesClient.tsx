"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  description: string;
  jobType: string;
  salary?: string | null;
}

interface RolesClientProps {
  jobs: Job[];
}

export default function RolesClient({ jobs }: RolesClientProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>(tabParam || "all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

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
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
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
      <div className="mb-8">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchQuery("");
            }}
            className={`px-6 py-3 font-medium transition-colors relative cursor-pointer ${
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

      {/* Job Cards Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No positions found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow bg-white overflow-hidden flex flex-col h-full">
              <CardHeader className="pb-0">
                <CardTitle className="text-xl">{job.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-2 mb-6 text-sm text-gray-700">
                  {job.description.split('\n').filter(line => line.trim()).slice(0, 3).map((point, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <span className="text-gray-400">•</span>
                      <span className="flex-1">{point.trim()}</span>
                    </li>
                  ))}
                </ul>
                {job.salary && (
                  <p className="text-green-700 font-semibold text-sm mb-6">
                    {job.salary}
                  </p>
                )}
                <div className="mt-auto">
                  <Link href={`/jobs/${job.id}`} className="cursor-pointer">
                    <Button className="w-full py-6 bg-black text-[#FFFFFF] hover:bg-gray-800 cursor-pointer">
                      View Details & Apply
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
