"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface StatusUpdateButtonProps {
  candidateId: string
  currentStatus: string
}

// Dropdown to update candidate application status
export default function StatusUpdateButton({ candidateId, currentStatus }: StatusUpdateButtonProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus)
    setLoading(true)

    try {
      const res = await fetch(`/api/candidates/${candidateId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        throw new Error("Failed to update status")
      }

      router.refresh()
    } catch (err) {
      console.error(err)
      setStatus(currentStatus)
    } finally {
      setLoading(false)
    }
  }

  // Returns color class based on status value
  const getStatusColor = (s: string) => {
    switch (s) {
      case "submitted":
        return "text-blue-600"
      case "in_review":
        return "text-yellow-600"
      case "selected":
        return "text-green-600"
      case "rejected":
        return "text-red-600"
      case "withdrawn":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-600">Status:</span>
      <Select value={status} onValueChange={handleStatusChange} disabled={loading}>
        <SelectTrigger className={`w-[180px] ${getStatusColor(status)}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="submitted">Submitted</SelectItem>
          <SelectItem value="in_review">In Review</SelectItem>
          <SelectItem value="selected">Selected</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
