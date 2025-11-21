import JobForm from "@/components/JobForm"

// Create a new job posting
export default function NewJobPage() {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Create New Job</h2>
      <JobForm />
    </div>
  )
}
