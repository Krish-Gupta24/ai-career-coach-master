"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TypeAnimation } from "react-type-animation";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const imageElement = imageRef.current;

      // ✅ prevent crash
      if (!imageElement) return;

      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="w-full pt-36 md:pt-48 pb-10">
      <div className="space-y-6 text-center">
        <div className="space-y-6 mx-auto">
          {/* ✅ TYPEWRITER FIXED */}
          <h1 className="text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl gradient-title animate-gradient">
            <TypeAnimation
              sequence={[
                "Your AI Interview Coach",
                1500,
                "Crack Interviews with Confidence",
                1500,
                "Get Hired Faster with AI",
                1500,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
            <br />
          </h1>

          <p className="mx-auto max-w-[600px] md:text-xl">
            Advance your career with personalized guidance, interview
            preparation, real time performance analysis and AI-powered tools for
            job success.
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          <Link href="/dashboard">
            <HoverBorderGradient
              as="button"
              containerClassName="rounded-lg"
              className="bg-[#ce4646] text-[#cdc2a4] px-8 py-3 text-base font-semibold flex items-center justify-center hover:bg-[#cdc2a4] hover:text-[#0e0b0d] transition-all duration-300"
            >
              Get Started
            </HoverBorderGradient>
          </Link>
        </div>

        <div className="hero-image-wrapper mt-5 md:mt-0">
          {/* ✅ ref only on div */}
          <div ref={imageRef} className="hero-image">
            <Image
              src="/banner.jpeg"
              width={1280}
              height={720}
              alt="Dashboard Preview"
              className="rounded-lg shadow-2xl border mx-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
