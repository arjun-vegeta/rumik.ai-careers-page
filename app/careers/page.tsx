import { Suspense } from "react";
import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ToastHandler from "@/components/ToastHandler";
import HomePage from "@/components/HomePage";

export const metadata: Metadata = {
  title: "Careers @rumik.ai",
  description: "Come build the most Human AI. Explore career opportunities and join our team.",
};

// Main careers landing page with job listings
export default function CareersPage() {
  return (
    <main className="bg-[#FCFAF7] text-black min-h-screen">
      <Navbar />
      <Suspense fallback={null}>
        <ToastHandler />
      </Suspense>
      <HomePage />
    </main>
  );
}
