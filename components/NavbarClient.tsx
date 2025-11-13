"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      router.push("/careers");
    });
  };

  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  };

  return (
    <header className={`bg-[#FCFAF7] w-full sticky top-0 z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'} border-b md:border-b-0 border-gray-200`}>
      <div className="max-w-full mx-auto px-4 md:px-12 py-4 md:py-6 flex items-center justify-between">
        <Link 
        href="/careers" 
        onClick={handleLogoClick}
        className="w-40 h-10 md:w-60 md:h-12 relative cursor-pointer block"
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
        <Link className="relative group cursor-pointer" href="/" prefetch={true}>
          <span className="relative">
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full origin-left"></span>
          </span>
        </Link>
        <Link className="relative group cursor-pointer" href="/roles" prefetch={true}>
          <span className="relative">
            Roles
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full origin-left"></span>
          </span>
        </Link>
        <a className="relative group cursor-pointer" href="https://rumik.ai/blogs" target="_blank" rel="noopener noreferrer">
          <span className="relative">
            Blogs
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full origin-left"></span>
          </span>
        </a>
        <a className="relative group cursor-pointer" href="https://rumik.ai/API" target="_blank" rel="noopener noreferrer">
          <span className="relative">
            API
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full origin-left"></span>
          </span>
        </a>
      </nav>

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 text-black"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className="hidden md:flex items-center gap-4">
        {isHydrated && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="inline-flex items-center gap-2 rounded-full bg-black text-[#E5E0CD] px-4 py-2 text-base font-semibold shadow hover:bg-[#E5E0CD] hover:border-2 hover:border-black hover:text-black transition-all duration-300 cursor-pointer border-2 border-black"
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
            className="inline-flex items-center gap-2 rounded-full bg-black text-[#E5E0CD] px-4 py-2 text-base font-semibold shadow hover:bg-[#E5E0CD] hover:border-2 hover:border-black hover:text-black transition-all duration-300 cursor-pointer border-2 border-black"
            aria-label="Login"
          >
            Login <ArrowRight size={18} />
          </a>
        ) : (
          // Show placeholder during SSR to match initial state
          <div className="w-[120px] h-12" />
        )}
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden absolute top-full left-0 right-0 bg-[#FCFAF7] border-b border-gray-200 shadow-lg overflow-hidden"
          >
            <motion.nav
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col px-4 py-4 space-y-4"
            >
              <Link 
                className="text-lg font-medium hover:text-gray-600 transition-colors" 
                href="/" 
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                className="text-lg font-medium hover:text-gray-600 transition-colors" 
                href="/roles" 
                onClick={() => setMobileMenuOpen(false)}
              >
                Roles
              </Link>
              <a 
                className="text-lg font-medium hover:text-gray-600 transition-colors" 
                href="https://rumik.ai/blogs" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Blogs
              </a>
              <a 
                className="text-lg font-medium hover:text-gray-600 transition-colors" 
                href="https://rumik.ai/API" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                API
              </a>

              <div className="pt-4 border-t border-gray-200">
                {isHydrated && user ? (
                  <div className="space-y-3">
                    <div className="px-3 py-2 bg-gray-100 rounded-lg">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                    </div>

                    {user.role === "recruiter" && (
                      <Link
                        href="/admin"
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    {user.role !== "recruiter" && (
                      <Link
                        href="/applications"
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Applications
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (typeof window !== 'undefined') {
                          sessionStorage.removeItem("navbar_user");
                          const currentPath = window.location.pathname;
                          window.location.href = `/api/auth/signout?callbackUrl=${encodeURIComponent(currentPath)}`;
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : isHydrated ? (
                  <a
                    href="/auth/signin"
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      if (typeof window !== 'undefined') {
                        window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-black text-[#E5E0CD] px-4 py-3 text-base font-semibold shadow hover:bg-[#E5E0CD] hover:border-2 hover:border-black hover:text-black transition-all duration-300 border-2 border-black"
                  >
                    Login <ArrowRight size={18} />
                  </a>
                ) : null}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </header>
  );
}
