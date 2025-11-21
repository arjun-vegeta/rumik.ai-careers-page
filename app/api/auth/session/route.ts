import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Returns current user session without caching
export async function GET() {
  try {
    const session = await auth();
    
    return NextResponse.json(
      {
        user: session?.user || null,
      },
      {
        headers: {
          "Cache-Control": "no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}
