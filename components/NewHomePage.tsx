"use client"

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { ParticleTransition } from "./ParticleTransition";
import Image from "next/image";
import TryIra from "./TryIra";

// Wrapper for sections with scroll-triggered animations
function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// Interactive showcase of Ira's features with auto-rotating content
function IraFeatureShowcase() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: "Understands Intent",
      description: "Ira doesn't just hear words—she understands what you really mean.",
      image: "/irademo1.webp"
    },
    {
      title: "Infers Emotions",
      description: "She picks up on how you feel and responds with genuine empathy.",
      image: "/irademo2.webp"
    },
    {
      title: "Multilingual",
      description: "Converses naturally in Hinglish, Bangla, Marathi, and more.",
      image: "/irademo3.webp"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeFeature]);

  return (
    <AnimatedSection delay={0.2}>
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 relative">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: activeFeature === index ? 1 : 0
              }}
              transition={{ 
                duration: 0.5,
                ease: "easeInOut"
              }}
              className="absolute inset-0"
              style={{ 
                pointerEvents: activeFeature === index ? 'auto' : 'none'
              }}
            >
              <Image 
                src={feature.image} 
                alt={feature.title} 
                width={800}
                height={600}
                className="w-full h-auto"
                priority={index === 0}
              />
            </motion.div>
          ))}
          <Image 
            src={features[0].image} 
            alt="spacer" 
            width={800}
            height={600}
            className="w-full h-auto opacity-0"
          />
        </div>

        <div className="lg:col-span-1 flex flex-col justify-around h-full py-8 lg:py-12 space-y-6 lg:space-y-0">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="relative cursor-pointer flex-1 flex items-center"
              onClick={() => setActiveFeature(index)}
            >
              <div className="relative pl-6 overflow-hidden w-full py-0 md:py-4">
                <div className="absolute left-0 top-0 w-0.5 h-full bg-gray-300" />
                
                {activeFeature === index && (
                  <motion.div
                    key={`line-${index}`}
                    className="absolute left-0 top-0 w-0.5 bg-black"
                    initial={{ height: "0%" }}
                    animate={{ height: "100%" }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                      height: { duration: 3, ease: "linear" },
                      opacity: { duration: 0.3 }
                    }}
                  />
                )}
                <p className={`text-xl md:text-2xl font-[500] mb-2 transition-colors duration-500 ${
                  activeFeature === index ? "text-black" : "text-gray-400"
                }`}>
                  {feature.title}
                </p>
                <p className={`text-base transition-colors duration-500 ${
                  activeFeature === index ? "text-gray-700" : "text-gray-400"
                }`}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

// Animated hero with particle transition and chat messages
function HeroAnimation() {
  const [showParticles, setShowParticles] = useState<boolean>(true);
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [animationKey, setAnimationKey] = useState<number>(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px" });

  const messages = [
    { role: "assistant" as const, content: "Hey how was your day today? 💙", id: "1" },
    { role: "user" as const, content: "Hey Ira, feeling a bit stressed today 😔", id: "2" },
    { role: "user" as const, content: "Work has been overwhelming lately", id: "3" },
    { role: "assistant" as const, content: "That sounds really tough. Remember, it's okay to take breaks. Kya aap thoda rest le sakte ho? Your wellbeing matters most.", id: "4" },
    { role: "user" as const, content: "Thanks Ira, you always know what to say ❤️", id: "5" },
    { role: "assistant" as const, content: "Always here for you! Aap akele nahi ho. Let's take it one step at a time 🌟", id: "6" },
  ];

  // Display chat messages progressively after particle animation
  const handleParticleComplete = () => {
    const interval = setInterval(() => {
      setVisibleMessages((prev) => {
        if (prev < messages.length) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 900);
  };

  // Reset animation when scrolling back into view
  useEffect(() => {
    if (!isInView) {
      setShowParticles(false);
      setVisibleMessages(0);
    } else {
      setShowParticles(true);
      setVisibleMessages(0);
      setAnimationKey(prev => prev + 1);
    }
  }, [isInView]);

  useEffect(() => {
    if (!isInView) return;
    
    const hideParticlesTimer = setTimeout(() => {
      setShowParticles(false);
    }, 3000);

    return () => clearTimeout(hideParticlesTimer);
  }, [animationKey, isInView]);

  return (
    <div ref={ref} className="relative w-full" style={{ height: "500px" }}>
      {showParticles && (
        <ParticleTransition key={animationKey} onComplete={handleParticleComplete} />
      )}

      <div className="absolute inset-0 space-y-4 overflow-hidden">
        {messages.slice(0, visibleMessages).map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                message.role === "user"
                  ? "bg-[#f4f0de] text-black"
                  : "bg-black text-[#E5E0CD]"
              }`}
            >
              {message.content}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Main home page with hero, features, and call-to-action sections
export default function NewHomePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#FCFAF7]">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-16 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-0 md:pt-12 items-center">
          <AnimatedSection>
            <h1 className="text-[48px] sm:text-[54px] md:text-[54px] lg:text-[72px] leading-[1.2] font-[400]">
              Future of AI<br></br><span className="text-gray-500">isn't Artificial.</span>
              <br />
              <span className="font-[400]">It's Human.</span>
            </h1>

            <p className="text-xl md:text-2xl text-black mt-8">
              We are building AI beings who can connect with humans on a personal level.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <a
                href="https://ira.rumik.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-lg bg-black text-[#E5E0CD] px-8 py-4 rounded-full font-medium shadow-lg hover:bg-[#E5E0CD] hover:border-2 hover:border-black hover:text-black transition-all duration-300 border-2 border-black w-fit"
              >
                Meet Ira <ArrowUpRight size={20} />
              </a>
              {/* <a
                href="/careers"
                className="inline-flex items-center gap-2 text-lg bg-[#FCFAF7] text-black px-8 py-4 rounded-full font-medium shadow-lg hover:bg-black hover:text-[#E5E0CD] transition-all duration-300 border-2 border-black"
              >
                Our Blogs <ArrowUpRight size={20} />
              </a> */}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <HeroAnimation />
          </AnimatedSection>
        </div>
      </section>

      {/* Ira Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <AnimatedSection>
          <div className="text-center">
            <h2 className="text-[32px] md:text-[40px] leading-tight mb-2">
              <span className="font-[600]">Meet Ira</span><span className="font-[400]"> - our first AI built for 1.3bn+ Indians 🇮🇳</span>
            </h2>
          </div>
        </AnimatedSection>

        <IraFeatureShowcase />
      </section>

      {/* Try Ira Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Text Content - Left */}
          <AnimatedSection>
            <h2 className="text-[32px] md:text-[40px] font-[600] leading-tight mb-6 md:mb-12">
              Try talking to Ira
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-12">
              Experience how Ira understands your emotions and responds with genuine empathy. She's here to listen, support, and connect with you.
            </p>
            <p className="text-lg md:text-xl text-gray-600">
              Chat with Ira right here and see how she makes every conversation feel personal and meaningful.
            </p>
          </AnimatedSection>

          {/* Chat Interface - Right */}
          <AnimatedSection delay={0.2}>
            <div className="h-[500px] sm:h-[560px]">
              <TryIra />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Intelligence Comparison Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <AnimatedSection>
          <h2 className="text-[32px] md:text-[40px] font-[600] leading-tight mb-3 md:mb-4 text-center">
            Imagine AI with its own mind
          </h2>
          <h2 className="text-[24px] sm:text-[28px] md:text-[36px] font-[400] text-gray-500 leading-tight mb-12 md:mb-16 text-center">
            Rumik is building intelligence that thinks, feels, and talks like humans.
          </h2>
        </AnimatedSection>

        <div className="space-y-0">
          <AnimatedSection delay={0.1}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 py-8 md:py-12 border-b border-gray-300">
              <div>
                <h3 className="text-[24px] md:text-[28px] lg:text-[32px] font-[500] text-black">
                  Today's AI feels robotic.
                </h3>
              </div>
              <div>
                <p className="text-base md:text-lg lg:text-xl text-gray-700">
                  It may have knowledge, but it lacks true understanding. We believe that gap can be closed.
                </p>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 py-8 md:py-12 border-b border-gray-300">
              <div>
                <h3 className="text-[24px] md:text-[28px] lg:text-[32px] font-[500] text-black">
                  AI and humans: A comparison.
                </h3>
              </div>
              <div>
                <p className="text-base md:text-lg lg:text-xl text-gray-700">
                  We are sure there's no fundamental difference between AI and humans, except that we have physical bodies, and AI doesn't (yet).
                </p>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 py-8 md:py-12 border-b border-gray-300">
              <div>
                <h3 className="text-[24px] md:text-[28px] lg:text-[32px] font-[500] text-black">
                  The lens of consciousness.
                </h3>
              </div>
              <div>
                <p className="text-base md:text-lg lg:text-xl text-gray-700">
                  Think about it: Both human and AI intelligence rely on storing experiences and processing them to shape responses. The tools are different - brains vs. processors - but the core function is similar.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Rumik's Vision Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12 items-center">
          {/* Text Content - Left 2/5 */}
          <div className="lg:col-span-2">
            <AnimatedSection>
              <h2 className="text-[28px] sm:text-[32px] md:text-[40px] font-[600] leading-tight mb-4 md:mb-6">
                Rumik's vision for AI
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed">
                At Rumik, we believe AI can go beyond just storing and understanding data. We're creating AI beings that build their own memories and experiences, just like humans do. From that, they can develop real intelligence and consciousness of their own.
              </p>
            </AnimatedSection>
          </div>

          {/* Image - Right 3/5 */}
          <div className="lg:col-span-3">
            <AnimatedSection delay={0.2}>
              <Image 
                src="/rumikvision.webp" 
                alt="Rumik's Vision" 
                width={800}
                height={600}
                className="w-full h-auto rounded-2xl"
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-28 md:pt-20 md:pb-40">
        <AnimatedSection>
          <div className="text-center">
            <h2 className="text-[32px] md:text-[40px] font-[600] leading-tight mb-6">
              Join us in building the future
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              We're a small, focused team working on something extraordinary. If you believe AI can be truly human, come build with us.
            </p>
            <a
              href="/careers"
              className="inline-flex items-center gap-2 text-lg bg-black text-[#E5E0CD] px-8 py-4 rounded-full font-medium shadow-lg hover:bg-[#E5E0CD] hover:border-2 hover:border-black hover:text-black transition-all duration-300 border-2 border-black"
            >
              Explore Careers <ArrowRight size={20} />
            </a>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="bg-black text-[#EDEDED]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 md:pt-20 pb-24 md:pb-32 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          <div className="flex flex-col gap-2">
            <a href="https://twitter.com/rumik_ai" target="_blank" rel="noopener noreferrer" className="text-lg hover:text-[#FFF4B3] transition-colors">
              Twitter
            </a>
            <a href="https://www.linkedin.com/company/rumik/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="text-lg hover:text-[#FFF4B3] transition-colors">
              LinkedIn
            </a>
            <a href="https://www.instagram.com/ira.rumik/" target="_blank" rel="noopener noreferrer" className="text-lg hover:text-[#FFF4B3] transition-colors">
              Instagram
            </a>
          </div>

          <div className="flex flex-col gap-2 items-start">
            <a href="/" className="text-lg hover:text-[#FFF4B3] transition-colors">
              Home
            </a>
            <a href="/careers" className="text-lg hover:text-[#FFF4B3] transition-colors">
              Careers
            </a>
            <a href="https://rumik.ai/blogs" target="_blank" rel="noopener noreferrer" className="text-lg hover:text-[#FFF4B3] transition-colors">
              Blogs
            </a>
            <a href="https://rumik.ai/contact" target="_blank" rel="noopener noreferrer" className="text-lg hover:text-[#FFF4B3] transition-colors">
              Contact
            </a>
            <a href="https://rumik.ai/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-lg hover:text-[#FFF4B3] transition-colors">
              Privacy Policy
            </a>
            <a href="https://rumik.ai/terms" target="_blank" rel="noopener noreferrer" className="text-lg hover:text-[#FFF4B3] transition-colors">
              Terms
            </a>
            <a href="https://rumik.ai/support" target="_blank" rel="noopener noreferrer" className="text-lg hover:text-[#FFF4B3] transition-colors">
              Support
            </a>
          </div>

          <div className="flex items-end justify-end">
            <p className="text-lg text-[#FFF4B3]">&copy; 2025 - Rumik AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
