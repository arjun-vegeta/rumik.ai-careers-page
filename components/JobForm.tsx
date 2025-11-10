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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <Label htmlFor="title">Job Title *</Label>
        <Input id="title" name="title" required defaultValue={job?.title} />
      </div>

      <div>
        <Label htmlFor="jobType">Job Type *</Label>
        <Select value={jobType} onValueChange={setJobType}>
          <SelectTrigger>
            <SelectValue placeholder="Select job type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="engineering">Engineering Roles</SelectItem>
            <SelectItem value="other">Other Roles</SelectItem>
            <SelectItem value="internship">Internships</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Job Description *</Label>
        <Textarea 
          id="description" 
          name="description" 
          required 
          rows={6}
          defaultValue={job?.description}
        />
      </div>

      <div>
        <Label htmlFor="details">Additional Details</Label>
        <Textarea 
          id="details" 
          name="details" 
          rows={4}
          defaultValue={job?.details || ""}
        />
      </div>

      <div>
        <Label htmlFor="skills">Skills</Label>
        <div className="flex gap-2 mb-2">
          <Input 
            id="skills"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            placeholder="Add a skill..."
          />
          <Button type="button" onClick={addSkill} variant="outline">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <div key={skill} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="text-gray-500 hover:text-black"
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
        <Label htmlFor="isActive">Active (visible to applicants)</Label>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-black text-[#FFF4B3] hover:bg-gray-800"
        >
          {loading ? "Saving..." : job ? "Update Job" : "Create Job"}
        </Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
