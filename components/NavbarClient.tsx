"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

interface User {
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

interface NavbarClientProps {
  user: User | null;
  isHydrated: boolean;
}

export default function NavbarClient({ user, isHydrated }: NavbarClientProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } 
      // Hide navbar when scrolling down and past 100px
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    startTransition(() => {
      router.push("/");
    });
  };

  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  };

  return (
    <header className={`bg-[#FCFAF7] w-full sticky top-0 z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
        <Link 
        href="/" 
        onClick={handleLogoClick}
        className="w-60 h-12 relative cursor-pointer block"
      >
        {isPending ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : (
          <Image 
            src="/careers_logo.webp" 
            alt="rumik.ai" 
            fill 
            style={{ objectFit: "contain" }} 
            priority 
            quality={90}
          />
        )}
      </Link>

      <nav className="hidden md:flex gap-8 text-lg font-medium absolute left-1/2 transform -translate-x-1/2">
        <Link className="relative group cursor-pointer" href="/roles" prefetch={true}>
          <span className="relative">
            Roles
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full origin-left"></span>
          </span>
        </Link>
        <Link 
          className="relative group cursor-pointer" 
          href="/#benefits"
          onClick={(e) => {
            const benefitsSection = document.getElementById('benefits');
            if (benefitsSection) {
              e.preventDefault();
              benefitsSection.scrollIntoView({ behavior: 'smooth' });
            }
            // If not on homepage, let the Link navigate normally
          }}
        >
          <span className="relative">
            Benefits
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full origin-left"></span>
          </span>
        </Link>
        <a className="relative group cursor-pointer" href="https://rumik.ai/blogs" target="_blank" rel="noopener noreferrer">
          <span className="relative">
            Blogs
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full origin-left"></span>
          </span>
        </a>
        <a className="relative group cursor-pointer" href="https://rumik.ai/" target="_blank" rel="noopener noreferrer">
          <span className="relative">
            About Us
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full origin-left"></span>
          </span>
        </a>
      </nav>

      <div className="flex items-center gap-4">
        {isHydrated && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="inline-flex items-center gap-2 rounded-full bg-black text-[#fce4bd] px-4 py-2 text-base font-semibold shadow hover:bg-[#fce4bd] hover:border-2 hover:border-black hover:text-black transition-all duration-300 cursor-pointer border-2 border-black"
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
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 mt-2 pt-2 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : isHydrated ? (
          <a
            href="/auth/signin"
            onClick={(e) => {
              e.preventDefault();
              if (typeof window !== 'undefined') {
                window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
              }
            }}
            className="inline-flex items-center gap-2 rounded-full bg-black text-[#fce4bd] px-4 py-2 text-base font-semibold shadow hover:bg-[#fce4bd] hover:border-2 hover:border-black hover:text-black transition-all duration-300 cursor-pointer border-2 border-black"
            aria-label="Login"
          >
            Login <ArrowRight size={18} />
          </a>
        ) : (
          // Show placeholder during SSR to match initial state
          <div className="w-[120px] h-12" />
        )}
      </div>
      </div>
    </header>
  );
}
