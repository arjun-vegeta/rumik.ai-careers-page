"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

// Shows loading progress bar during page navigation
export default function NavigationProgress() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    Promise.resolve().then(() => {
      setIsLoading(false)
    })
  }, [pathname])

  // Detect link clicks and show loading indicator
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link && link.href && link.href.includes(window.location.origin)) {
        const url = new URL(link.href)
        if (url.pathname !== pathname && !link.target) {
          setIsLoading(true)
        }
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [pathname])

  if (!isLoading) return null

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
        <div 
          className="h-full bg-gradient-to-r from-black via-gray-700 to-black"
          style={{
            animation: 'progress 1.2s ease-out forwards',
            width: '0%'
          }}
        />
      </div>
      
      <div className="fixed inset-0 z-40 bg-white bg-opacity-30 backdrop-blur-[2px] pointer-events-none" />
      
      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 60%;
          }
          70% {
            width: 80%;
          }
          100% {
            width: 95%;
          }
        }
      `}</style>
    </>
  )
}
