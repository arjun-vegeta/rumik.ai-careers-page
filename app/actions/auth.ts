"use server";

import { signOut } from "@/lib/auth";

export async function handleSignOut(callbackUrl?: string) {
  const redirectUrl = callbackUrl ? `${callbackUrl}?toast=logout` : "/?toast=logout";
  await signOut({ redirectTo: redirectUrl });
}
