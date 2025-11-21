"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Toast from "./Toast";

// Handles login/logout toast notifications from URL parameters
export default function ToastHandler() {
  const searchParams = useSearchParams();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const toastParam = searchParams.get("toast");
    if (toastParam === "login") {
      setToast({ message: "Logged in successfully!", type: "success" });
      window.history.replaceState({}, "", window.location.pathname);
    } else if (toastParam === "logout") {
      setToast({ message: "Logged out successfully!", type: "success" });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams]);

  if (!toast) return null;

  return <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />;
}
