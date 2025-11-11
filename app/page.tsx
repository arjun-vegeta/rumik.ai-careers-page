"use client"

import Image from "next/image";
import { Manrope } from "next/font/google";
import React, { useState, Suspense, memo } from "react";
import BenefitLine from "@/components/BenefitLine";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { WorldMap } from "@/components/ui/world-map";
import Navbar from "@/components/Navbar";
import ToastHandler from "@/components/ToastHandler";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

function HoverCursor() {
  // simple component to render a custom circle cursor with an arrow SVG
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: -100, y: -100 });

  // attach mousemove on document when visible
  React.useEffect(() => {
    if (!visible) return;
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    document.addEventListener("mousemove", move);
    return () => document.removeEventListener("mousemove", move);
  }, [visible]);

  return (
    <>
      {/* global state toggles via custom events from RoleLink components */}
      <div
        id="custom-cursor"
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          transition: "transform 0.02s linear",
          zIndex: 9999,
          display: visible ? "block" : "none",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "9999px",
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
          }}
        >
          <ArrowRight size={20} color="#fff" />
        </div>
      </div>

      <CursorVisibilityController onChange={(v) => setVisible(v)} />
    </>
  );
}

// tiny helper to receive custom show/hide events
function CursorVisibilityController({ onChange }: { onChange: (v: boolean) => void }) {
  React.useEffect(() => {
    const show = () => onChange(true);
    const hide = () => onChange(false);
    window.addEventListener("rumik-cursor-show", show as EventListener);
    window.addEventListener("rumik-cursor-hide", hide as EventListener);
    return () => {
      window.removeEventListener("rumik-cursor-show", show as EventListener);
      window.removeEventListener("rumik-cursor-hide", hide as EventListener);
    };
  }, [onChange]);
  return null;
}

function RoleLink({ children, href }: { children: React.ReactNode; href: string }) {
  // Role link that triggers custom cursor and hides the OS cursor while hovered
  const onMouseEnter = (e: React.MouseEvent) => {
    // hide native cursor for the hovered element via style
    const target = e.currentTarget as HTMLElement;
    target.style.cursor = "none";
    window.dispatchEvent(new CustomEvent("rumik-cursor-show"));
  };
  const onMouseLeave = (e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.cursor = "";
    window.dispatchEvent(new CustomEvent("rumik-cursor-hide"));
  };
  return (
    <a
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="block py-8 border-b border-black/30 text-[40px] sm:text-[48px] md:text-[50px] lg:text-[56px] xl:text-[66px] font-[400] text-left whitespace-nowrap"
      href={href}
    >
      {children}
    </a>
  );
}

export default function Page() {
  return (
    <main className={`${manrope.className} bg-[#FCFAF7] text-black min-h-screen`}>
      <HoverCursor />
      <Navbar />
      <Suspense fallback={null}>
        <ToastHandler />
      </Suspense>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-12 pb-16 md:pb-24 flex flex-col md:flex-row items-center gap-8">
        <div className="w-full md:w-1/2 pt-0 md:pt-12">
          <h1 className="text-[48px] sm:text-[48px] md:text-[50px] lg:text-[56px] xl:text-[66px] leading-[1.3] font-[400] max-w-xl">
            Come build
            <br />
            <span className="block font-[400]">the most Human AI</span>
            <span className="block font-[400] text-gray-500">@rumik.ai</span>
          </h1>

          <div className="mt-8">
            <a
              href="#roles"
              className="inline-flex items-center gap-2 text-lg bg-black text-[#F3E6D2] px-8 py-4 rounded-full font-medium shadow-lg"
            >
              Explore Available Roles <ArrowUpRight size={20} />
            </a>
          </div>
        </div>

        {/* world map on the right */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="w-full">
            <WorldMap 
              dots={[
                {
                  start: { lat: 6.5937, lng: 78.9629 }, // India (center)
                  end: { lat: 37.7749, lng: -122.4194 }, // San Francisco
                },
                {
                  start: { lat: 6.5937, lng: 78.9629 }, // India
                  end: { lat: 51.5074, lng: -0.1278 }, // London
                },
                {
                  start: { lat: 6.5937, lng: 78.9629 }, // India
                  end: { lat: 40.7128, lng: -74.0060 }, // New York
                },
                {
                  start: { lat: 6.5937, lng: 78.9629 }, // India
                  end: { lat: 35.6762, lng: 139.6503 }, // Tokyo
                },
                {
                  start: { lat: 6.5937, lng: 78.9629 }, // India
                  end: { lat: 1.3521, lng: 103.8198 }, // Singapore
                },
                {
                  start: { lat: 6.5937, lng: 78.9629 }, // India
                  end: { lat: -43.8688, lng: 151.2093 }, // Sydney
                },
                {
                  start: { lat: 6.5937, lng: 78.9629 }, // India
                  end: { lat: -23.5505, lng: -46.6333 }, // São Paulo, Brazil
                },
                {
                  start: { lat: 6.5937, lng: 78.9629 }, // India
                  end: { lat: -1.2921, lng: 36.8219 }, // Nairobi, Kenya
                },
              ]}
              lineColor="#000000"
            />
          </div>
        </div>
      </section>

      {/* Second section (centered heading + left copy + right stats) */}
      <section className="max-w-7xl mx-auto px-6 md:py-24 py-12">
        <div className="text-center">
          <h2 className="text-[28px] md:text-[34px] font-[400] leading-tight">
            rumik is a small, focused research lab building
            <br />
            <span className="font-[300] text-gray-500 text-[28px] md:text-[34px]">the most human ai</span>
          </h2>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          {/* Left column (below heading) */}
          <div>
            <div className="text-left">
              <p className="text-lg leading-7">
                Ira is our first creation.
                <br /> <br />
                Our users talk to Ira for 47 minutes every day. <br></br>ChatGPT gets 11 minutes. Character gets 8. We get 47.
              </p>

              <div className="mt-6">
                <div className="w-60 h-12 relative">
                  <Image src="/RumikTeam.svg" alt="Rumik Team" fill style={{ objectFit: "contain", objectPosition: "left" }} />
                </div>
                <p className="text-lg text-gray-500">Research Lab</p>
              </div>
            </div>
          </div>

          {/* Right column: stats */}
          <div className="space-y-12">
            {/* Single line above both stats */}
            
            {/* Two stats side by side with gap */}
            <div className="grid grid-cols-2 gap-12 items-start">
              <div className="border-t border-black/10 pt-4">
                <p className="text-2xl md:text-3xl font-[700]">1.5m+ users</p>
                <p className="text-lg text-gray-500">500million+ messages.</p>
              </div>

              <div className="border-t border-black/10 pt-4">
                <p className="text-2xl md:text-3xl font-[700]">No PMs</p>
                <p className="text-lg text-gray-500">No decks. No meetings.</p>
              </div>
            </div>

            {/* below them: full width stat */}
            <div className="border-t border-black/10 pt-4">
              <p className="text-2xl md:text-3xl font-[700]">4 years runway to run 100 experiments</p>
              <p className="text-lg text-gray-500">shipping the 10 that work.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits big centered list (each line single, bigger) */}
      <section className="max-w-7xl mx-auto px-6 text-center md:py-24 py-12">
        <p className="text-[28px] md:text-[34px] text-black ">benfits: <span className="text-gray-500">we solved the actual problem.</span></p>

        <div className="mt-16 space-y-6">
          <BenefitLine text="housing:" highlightText="we pay your rent." image="/benefits/Housing.png" />
          <BenefitLine text="health insurance:" highlightText="for you + your family" image="/benefits/Insurance.png" />
          <BenefitLine text="chef makes" highlightText="lunch and dinner." image="/benefits/Chef.png" />
          <BenefitLine text="off-sites: quarterly." highlightText="small team = everyone goes" image="/benefits/Offsite.png" />
          <BenefitLine text="time off: take what you need." highlightText="don't ask permission." image="/benefits/Timeoff.png" />
          <BenefitLine text="remote:" highlightText="needs mutual agreement." image="/benefits/Remote.png" />
        </div>

        <div className="mt-6 md:mt-12 px-0 max-w-4xl mx-auto">
          <div className="text-black font-[700] md:text-center text-left flex md:block">
            <span className="md:hidden mr-2 text-[clamp(1rem,4vw,1.5rem)]">•</span>
            <span className="text-[clamp(1rem,4vw,1.5rem)] md:text-[clamp(1.5rem,2.5vw,2.25rem)]">
              2 by 2 rule: <span className="text-gray-500"> after 2 years, take 2 months for whatever. come back? your equity doubles.</span>
            </span>
          </div>
        </div>
      </section>

      {/* Select your fit - full width max-7xl, left aligned, larger */}
      <section id="roles" className="max-w-7xl mx-auto px-6 md:py-24 py-12">
        <p className=" text-center text-[28px] md:text-[34px] text-black">select <span className="text-gray-500">your fit</span></p>

        <div className="mt-8 space-y-2">
          <div className="w-full">
            <RoleLink href="/roles?tab=engineering">Engineering Roles</RoleLink>
          </div>

          <div className="w-full">
            <RoleLink href="/roles?tab=other">Other Roles</RoleLink>
          </div>

          <div className="w-full">
            <RoleLink href="/roles?tab=internship">Internships</RoleLink>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 bg-black text-[#EDEDED]">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-32 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-lg">Twitter</p>
            <p className="text-lg">Linkedin</p>
            <p className="text-lg">Instagram</p>
          </div>

          <div className="flex flex-col gap-2 items-start">
            <a className="text-lg">Home</a>
            <a className="text-lg">Career</a>
            <a className="text-lg">Contact</a>
            <a className="text-lg">Privacy Policy</a>
            <a className="text-lg">Terms</a>
            <a className="text-lg">Support</a>
          </div>

          <div className="flex items-end justify-end">
            <p className="text-xs">&copy; 2025 - Rumik AI</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
