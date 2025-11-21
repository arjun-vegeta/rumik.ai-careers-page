"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface AIInsightButtonProps {
  candidateId: string
  jobId: string
}

// Triggers AI-powered candidate insights generation
export default function AIInsightButton({ candidateId, jobId }: AIInsightButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleGenerateInsight = async () => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/ai/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, jobId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to generate insights")
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button 
        onClick={handleGenerateInsight}
        disabled={loading}
        className="bg-black text-[#FFF4B3] hover:bg-[#E5E0CD] hover:border-2 hover:border-black hover:text-black transition-all duration-300 border-2 border-black"
      >
        {loading ? "Generating..." : "Generate AI Insight"}
      </Button>
      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}
