"use client";

import { useEffect, useState } from "react";
import NavbarClient from "./NavbarClient";

interface User {
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated and load cached data
    setIsHydrated(true);
    
    try {
      const cached = sessionStorage.getItem("navbar_user");
      if (cached) {
        setUser(JSON.parse(cached));
      }
    } catch {
      // Invalid cache
    }

    // Fetch fresh session data in background
    fetch("/api/auth/session", {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => {
        const userData = data.user || null;
        setUser(userData);
        // Update cache
        if (userData) {
          sessionStorage.setItem("navbar_user", JSON.stringify(userData));
        } else {
          sessionStorage.removeItem("navbar_user");
        }
      })
      .catch(() => {
        setUser(null);
        sessionStorage.removeItem("navbar_user");
      });
  }, []);

  // During SSR and initial hydration, always show null to match server
  return <NavbarClient user={isHydrated ? user : null} />;
}
