"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface User {
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

interface NavbarClientProps {
  user: User | null;
}

export default function NavbarClient({ user }: NavbarClientProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  };

  return (
    <header className="bg-[#FCFAF7] max-w-7xl mx-auto px-8 py-8 flex items-center justify-between">
      <Link href="/" prefetch={true} className="w-60 h-12 relative cursor-pointer">
        <Image src="/careers_logo.webp" alt="rumik.ai" fill style={{ objectFit: "contain" }} priority />
      </Link>

      <nav className="hidden md:flex gap-8 text-lg font-medium absolute left-1/2 transform -translate-x-1/2">
        <Link className="hover:underline" href="/roles">
          Roles
        </Link>
        <Link className="hover:underline" href="/#benefits">
          Benefits
        </Link>
        <a className="hover:underline" href="https://rumik.ai/blogs" target="_blank" rel="noopener noreferrer">
          Blogs
        </a>
        <a className="hover:underline" href="https://rumik.ai/" target="_blank" rel="noopener noreferrer">
          About Us
        </a>
      </nav>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="inline-flex items-center gap-2 rounded-full bg-black text-[#F5E69A] px-6 py-3 text-base font-semibold shadow hover:bg-gray-800 transition-colors"
            >
              {getUserDisplayName()}
              <ChevronDown size={18} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm text-gray-500">Signed in as</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                </div>

                {user.role === "recruiter" && (
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}

                {user.role !== "recruiter" && (
                  <Link
                    href="/applications"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    My Applications
                  </Link>
                )}

                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      sessionStorage.removeItem("navbar_user");
                      const currentPath = window.location.pathname;
                      window.location.href = `/api/auth/signout?callbackUrl=${encodeURIComponent(currentPath)}`;
                    }
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 mt-2 pt-2"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <a
            href="/auth/signin"
            onClick={(e) => {
              e.preventDefault();
              if (typeof window !== 'undefined') {
                window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
              }
            }}
            className="inline-flex items-center gap-2 rounded-full bg-black text-[#F5E69A] px-6 py-3 text-base font-semibold shadow hover:bg-gray-800 transition-colors"
            aria-label="Login"
          >
            Login <ArrowRight size={18} />
          </a>
        )}
      </div>
    </header>
  );
}
