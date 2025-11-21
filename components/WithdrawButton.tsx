"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface WithdrawButtonProps {
  applicationId: string
}

// Button to withdraw a job application with confirmation dialog
export default function WithdrawButton({ applicationId }: WithdrawButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")

  const handleWithdraw = async () => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`/api/applications/${applicationId}/withdraw`, {
        method: "POST",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to withdraw application")
      }

      setOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw Application</DialogTitle>
          <DialogDescription>
            Are you sure you want to withdraw this application? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
            {error}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleWithdraw}
            disabled={loading}
          >
            {loading ? "Withdrawing..." : "Withdraw Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
