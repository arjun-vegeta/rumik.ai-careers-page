"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface JobFormProps {
  job?: {
    id: string
    title: string
    jobType: string
    description: string
    details: string | null
    skills: string[]
    isActive: boolean
  }
}

export default function JobForm({ job }: JobFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [skills, setSkills] = useState<string[]>(job?.skills || [])
  const [skillInput, setSkillInput] = useState("")
  const [jobType, setJobType] = useState(job?.jobType || "engineering")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get("title"),
      jobType,
      description: formData.get("description"),
      details: formData.get("details"),
      skills,
      isActive: formData.get("isActive") === "on",
    }

    try {
      const url = job ? `/api/jobs/${job.id}` : "/api/jobs"
      const method = job ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        throw new Error("Failed to save job")
      }

      router.push("/admin")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()])
      setSkillInput("")
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 max-w-2xl">
      <div className="space-y-1.5 md:space-y-2">
        <Label htmlFor="title" className="text-sm md:text-base">Job Title *</Label>
        <Input id="title" name="title" required defaultValue={job?.title} className="bg-white text-sm md:text-base" />
      </div>

      <div className="space-y-1.5 md:space-y-2">
        <Label htmlFor="jobType" className="text-sm md:text-base">Job Type *</Label>
        <Select value={jobType} onValueChange={setJobType}>
          <SelectTrigger className="bg-white text-sm md:text-base">
            <SelectValue placeholder="Select job type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="engineering">Engineering Roles</SelectItem>
            <SelectItem value="other">Other Roles</SelectItem>
            <SelectItem value="internship">Internships</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 md:space-y-2">
        <Label htmlFor="description" className="text-sm md:text-base">Job Description *</Label>
        <Textarea 
          id="description" 
          name="description" 
          required 
          rows={6}
          defaultValue={job?.description}
          className="bg-white text-sm md:text-base"
        />
      </div>

      <div className="space-y-1.5 md:space-y-2">
        <Label htmlFor="details" className="text-sm md:text-base">Additional Details</Label>
        <Textarea 
          id="details" 
          name="details" 
          rows={4}
          defaultValue={job?.details || ""}
          className="bg-white text-sm md:text-base"
        />
      </div>

      <div className="space-y-1.5 md:space-y-2">
        <Label htmlFor="skills" className="text-sm md:text-base">Skills</Label>
        <div className="flex gap-2 mb-2">
          <Input 
            id="skills"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            placeholder="Add a skill..."
            className="bg-white text-sm md:text-base"
          />
          <Button type="button" onClick={addSkill} variant="outline" className="text-sm md:text-base">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <div key={skill} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
              <span className="text-sm">{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="text-gray-500 hover:text-black text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          id="isActive" 
          name="isActive" 
          defaultChecked={job?.isActive ?? true}
          className="w-4 h-4"
        />
        <Label htmlFor="isActive" className="text-sm md:text-base">Active (visible to applicants)</Label>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 md:p-4 rounded text-sm md:text-base">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full sm:w-auto bg-black text-[#E5E0CD] hover:bg-[#E5E0CD] hover:border-2 hover:border-black hover:text-black transition-all duration-300 border-2 border-black text-sm md:text-base"
        >
          {loading ? "Saving..." : job ? "Update Job" : "Create Job"}
        </Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={() => router.back()}
          className="w-full sm:w-auto text-sm md:text-base"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
