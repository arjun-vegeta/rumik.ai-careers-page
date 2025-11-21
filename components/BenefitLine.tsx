"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface BenefitLineProps {
  text: string
  highlightText: string
  image: string
}

// Animated benefit display with expanding image reveal on scroll
export default function BenefitLine({ text, highlightText, image }: BenefitLineProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showImage, setShowImage] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          setTimeout(() => setShowImage(true), 500)
          
          if (ref.current) {
            observer.unobserve(ref.current)
          }
        }
      },
      { 
        threshold: 0.3,
        rootMargin: "0px"
      }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

  return (
    <div ref={ref} className="w-full">
      <div className="md:hidden text-left px-0 flex">
        <span className="font-[700] mr-2" style={{ fontSize: "clamp(1rem, 4vw, 1.5rem)" }}>•</span>
        <p className="font-[700] flex-1" style={{ fontSize: "clamp(1rem, 4vw, 1.5rem)" }}>
          {text} {highlightText}
        </p>
      </div>
      
      <div className="hidden md:flex items-center justify-center">
        <p className="font-[700] whitespace-nowrap" style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)" }}>
          {text}
        </p>
        
        <div 
          className="relative inline-block overflow-hidden"
          style={{
            width: isVisible ? "80px" : "0px",
            height: "80px",
            marginLeft: isVisible ? "1rem" : "0px",
            marginRight: isVisible ? "1rem" : "0px",
            transitionProperty: "width, margin-left, margin-right",
            transitionDuration: "1000ms",
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div className="relative w-[80px] h-[80px]">
            <div 
              className={`absolute inset-0 rounded-md overflow-hidden flex items-center justify-center transition-opacity duration-500 ${
                showImage ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image 
                src={image} 
                alt={text}
                width={80}
                height={80}
                className="object-contain max-h-[80px] w-auto"
              />
            </div>
          </div>
        </div>
        
        <p className="font-[700] whitespace-nowrap" style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)" }}>
          {highlightText}
        </p>
      </div>
    </div>
  )
}
