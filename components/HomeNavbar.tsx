"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HomeNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header className={`bg-[#FCFAF7] backdrop-blur-md w-full fixed top-0 z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'} border-b md:border-b-0 border-gray-200`}>
      <div className="max-full mx-auto px-4 md:px-12 py-4 md:py-6 flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="w-40 h-10 md:w-48 md:h-12 relative cursor-pointer block"
        >
          <Image 
            src="/homelogo.avif" 
            alt="rumik.ai" 
            fill 
            style={{ objectFit: "contain" }} 
            priority 
            quality={90}
          />
        </Link>

        {/* Centered Navigation */}
        <nav className="hidden md:flex gap-8 text-lg font-medium absolute left-1/2 transform -translate-x-1/2">
          <Link className="relative group cursor-pointer" href="/">
            <span className="relative">
              Home
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
                    <Link className="relative group cursor-pointer" href="/careers">
            <span className="relative">
              Careers
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full origin-left"></span>
            </span>
          </Link>
        </nav>

        {/* Talk to Ira Button - Desktop */}
        <a
          href="https://ira.rumik.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 text-base bg-black text-[#E5E0CD] px-6 py-2.5 rounded-full font-medium shadow-lg hover:bg-[#E5E0CD] hover:text-black transition-all duration-300 border-2 border-black"
        >
          Talk to Ira <ArrowUpRight size={18} />
        </a>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-black"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden absolute top-full left-0 right-0 bg-[#FCFAF7] backdrop-blur-md border-b border-gray-200 shadow-lg overflow-hidden"
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
                href="/careers"
                onClick={() => setMobileMenuOpen(false)}
              >
                Careers
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
                href="https://rumik.ai/api" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                API
              </a>
              
              {/* Talk to Ira Button - Mobile */}
              <a
                href="https://ira.rumik.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-base bg-black text-[#E5E0CD] px-6 py-3 rounded-full font-medium shadow-lg hover:bg-[#E5E0CD] hover:text-black transition-all duration-300 border-2 border-black mt-2"
              >
                Talk to Ira <ArrowUpRight size={18} />
              </a>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
