"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { signIn } from "next-auth/react"
import { Upload } from "lucide-react"
import Image from "next/image"

interface ApplyFormProps {
  job: {
    id: string
    title: string
    description: string
  }
  session: any
}

export default function ApplyForm({ job, session }: ApplyFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [fileName, setFileName] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to submit application")
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="bg-gray-50 p-6 md:p-8 rounded-lg text-center">
        <p className="mb-4 text-sm md:text-base text-gray-700">Please sign in with Google to apply</p>
        <div className="flex justify-center">
          <Button 
            onClick={() => signIn("google")}
            className="bg-black text-[#FFF4B3] hover:bg-[#E5E0CD] hover:border-2 hover:border-black hover:text-black transition-all duration-300 border-2 border-black flex items-center justify-center gap-2 py-5 md:py-6 text-sm md:text-base"
          >
            <Image src="/google.svg" alt="Google" width={20} height={20} />
            Sign in with Google
          </Button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="bg-green-50 p-6 md:p-8 rounded-lg text-center">
        <h3 className="text-xl md:text-2xl font-bold mb-2 text-green-800">Application Submitted!</h3>
        <p className="text-sm md:text-base text-green-700">We'll review your application and get back to you soon.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      <input type="hidden" name="jobId" value={job.id} />
      
      <div className="space-y-1.5 md:space-y-2">
        <Label htmlFor="name" className="text-sm md:text-base">Full Name *</Label>
        <Input id="name" name="name" required defaultValue={session.user.name || ""} className="bg-white text-sm md:text-base" />
      </div>

      <div className="space-y-1.5 md:space-y-2">
        <Label htmlFor="email" className="text-sm md:text-base">Email *</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          required 
          defaultValue={session.user.email}
          readOnly
          className="bg-gray-100 text-sm md:text-base"
        />
      </div>

      <div className="space-y-1.5 md:space-y-2">
        <Label htmlFor="contact" className="text-sm md:text-base">Phone Number *</Label>
        <Input id="contact" name="contact" type="tel" required className="bg-white text-sm md:text-base" />
      </div>

      <div className="space-y-1.5 md:space-y-2">
        <Label htmlFor="resume" className="text-sm md:text-base">Resume (PDF) *</Label>
        <div className="relative">
          <input
            id="resume"
            name="resume"
            type="file"
            accept=".pdf"
            required
            onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
            className="hidden"
          />
          <label
            htmlFor="resume"
            className="flex items-center justify-center gap-2 w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <Upload size={18} className="text-gray-500" />
            <span className="text-xs md:text-sm text-gray-600 text-center">
              {fileName || "Choose PDF file or drag and drop"}
            </span>
          </label>
        </div>
      </div>

      <div className="space-y-1.5 md:space-y-2">
        <Label htmlFor="whyFit" className="text-sm md:text-base">Why are you a good fit for this role? *</Label>
        <Textarea 
          id="whyFit" 
          name="whyFit" 
          required 
          rows={5}
          placeholder="Tell us about your experience and why you're interested in this position..."
          className="bg-white text-sm md:text-base"
        />
      </div>

      <div className="space-y-1.5 md:space-y-2">
        <Label htmlFor="portfolio" className="text-sm md:text-base">Portfolio URL</Label>
        <Input id="portfolio" name="portfolio" type="url" placeholder="https://" className="bg-white text-sm md:text-base" />
      </div>

      <div className="space-y-1.5 md:space-y-2">
        <Label htmlFor="linkedin" className="text-sm md:text-base">LinkedIn Profile</Label>
        <Input id="linkedin" name="linkedin" type="url" placeholder="https://linkedin.com/in/..." className="bg-white text-sm md:text-base" />
      </div>

      <div className="space-y-1.5 md:space-y-2">
        <Label htmlFor="github" className="text-sm md:text-base">GitHub Profile</Label>
        <Input id="github" name="github" type="url" placeholder="https://github.com/..." className="bg-white text-sm md:text-base" />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 md:p-4 rounded text-sm md:text-base">
          {error}
        </div>
      )}

      <Button 
        type="submit" 
        disabled={loading}
        className="bg-black py-5 md:py-6 text-sm md:text-base text-[#E5E0CD] hover:bg-gray-800 w-full"
      >
        {loading ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  )
}
