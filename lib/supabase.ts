import { createClient } from "@supabase/supabase-js"

// ============================================
// Supabase Storage Configuration
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Uploads candidate resume to Supabase storage and returns public URL
export async function uploadResume(file: File, candidateId: string): Promise<string> {
  const fileExt = file.name.split(".").pop()
  const fileName = `${candidateId}-${Date.now()}.${fileExt}`
  const filePath = `resumes/${fileName}`

  const { data, error } = await supabase.storage
    .from("resumes")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload resume: ${error.message}`)
  }

  const { data: urlData } = supabase.storage
    .from("resumes")
    .getPublicUrl(filePath)

  return urlData.publicUrl
}
