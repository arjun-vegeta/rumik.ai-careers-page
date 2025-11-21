import { signOut } from "@/lib/auth";
import { NextRequest } from "next/server";

// Handles user logout and redirects with toast notification
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  
  await signOut({ redirectTo: `${callbackUrl}?toast=logout` });
}
