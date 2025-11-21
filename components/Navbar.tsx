"use client";

import { useEffect, useState } from "react";
import NavbarClient from "./NavbarClient";

interface User {
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

// Server-rendered wrapper that fetches and caches user session
let globalUserCache: User | null = null;
let isFetching = false;

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      setIsHydrated(true);
      
      if (globalUserCache) {
        setUser(globalUserCache);
        return;
      }
      
      try {
        const cached = sessionStorage.getItem("navbar_user");
        if (cached) {
          const cachedUser = JSON.parse(cached);
          globalUserCache = cachedUser;
          setUser(cachedUser);
          return;
        }
      } catch {
      }
      
      // If already fetching, skip
      if (isFetching) return;
      
      isFetching = true;

      fetch("/api/auth/session", {
        cache: "no-store",
      })
        .then((res) => res.json())
        .then((data) => {
          const userData = data.user || null;
          setUser(userData);
          globalUserCache = userData;
          
          if (userData) {
            sessionStorage.setItem("navbar_user", JSON.stringify(userData));
          } else {
            sessionStorage.removeItem("navbar_user");
          }
        })
        .catch(() => {
          setUser(null);
          globalUserCache = null;
          sessionStorage.removeItem("navbar_user");
        })
        .finally(() => {
          isFetching = false;
        });
    });
  }, []);

  return <NavbarClient user={user} isHydrated={isHydrated} />;
}
