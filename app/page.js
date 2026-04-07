import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Trophy,
  Target,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import HeroSection from "@/components/hero";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { features } from "@/data/features";
import { testimonial } from "@/data/testimonial";
import { faqs } from "@/data/faqs";
import FeatureCard from "@/components/FeatureCard";
import { howItWorks } from "@/data/howItWorks";
import NumberTicker from "@/components/NumberTicker";
import { AnimatedSection } from "@/components/AnimatedSection";

export default function LandingPage() {
  return (
    <>
      <div className="grid-background"></div>

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ce4646]/10 rounded-full blur-3xl opacity-50 -z-10 animate-pulse"></div>
        <AnimatedSection className="container mx-auto px-4 md:px-6 relative z-10" direction="up">
          <h2 className="text-3xl font-bold tracking-tighter text-[#ce4646] text-center mb-12">
            Powerful Features of PREVO
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <AnimatedSection key={index} delay={index * 0.1} direction="up" className="h-full">
                <Link href={feature.link} className="block h-full transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-2">
                  <FeatureCard feature={feature} />
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 md:py-24 bg-muted/50 border-y border-border/50 relative">
        <AnimatedSection className="container mx-auto px-4 md:px-6" direction="up" delay={0.2}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {[
              { num: 50, suffix: "+", label: "Industries Covered" },
              { num: 1000, suffix: "+", label: "Interview Questions" },
              { num: 95, suffix: "%", label: "Success Rate" },
              { num: 24, suffix: "/7", label: "AI Support" }
            ].map((stat, i) => (
              <AnimatedSection key={i} delay={i * 0.1} direction="up" className="flex flex-col items-center justify-center space-y-2 group">
                <h3 className="text-4xl text-[#ce4646] font-bold drop-shadow-[0_0_15px_rgba(206,70,70,0.3)] group-hover:drop-shadow-[0_0_25px_rgba(206,70,70,0.6)] transition-all duration-300">
                  <NumberTicker end={stat.num} suffix={stat.suffix} />
                </h3>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-24 bg-background relative overflow-hidden">
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#cdc2a4]/10 rounded-full blur-3xl opacity-50 -z-10 animate-pulse"></div>
        <AnimatedSection className="container mx-auto px-4 md:px-6 z-10 relative">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-[#ce4646] mb-4 drop-shadow-md">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Four simple steps to accelerate your career growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {howItWorks.map((item, index) => (
              <AnimatedSection
                key={index}
                delay={index * 0.15}
                direction="up"
                className="flex flex-col items-center text-center space-y-4 group"
              >
                <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#ce4646] group-hover:border-[#ce4646] group-hover:bg-[#ce4646]/10 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.2)] group-hover:shadow-[0_0_30px_rgba(206,70,70,0.2)] group-hover:-translate-y-2">
                  <div className="transform scale-150 transition-transform duration-300 group-hover:scale-110">
                    {item.icon}
                  </div>
                </div>
                <h3 className="font-bold text-xl text-foreground">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </section>

      <section className="w-full py-12 md:py-24 bg-muted/50 border-y border-border/50">
        <AnimatedSection className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl text-[#ce4646] font-bold text-center mb-12">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonial.map((testimonial, index) => (
              <AnimatedSection key={index} delay={index * 0.2} direction="up" className="h-full">
                <Card className="bg-background h-full hover:shadow-[0_0_40px_rgba(206,70,70,0.08)] transition-shadow duration-300 border-zinc-800/50">
                  <CardContent className="pt-6 h-full flex flex-col justify-between">
                    <div className="flex flex-col space-y-6">
                      <blockquote>
                        <p className="text-muted-foreground/90 italic relative leading-relaxed text-lg font-medium">
                          <span className="text-4xl font-serif text-[#ce4646]/40 absolute -top-4 -left-3">
                            &quot;
                          </span>
                          {testimonial.quote}
                        </p>
                      </blockquote>
                      <div className="flex items-center space-x-4 mt-auto pt-4 border-t border-border/50">
                        <div className="relative h-14 w-14 flex-shrink-0">
                          <Image
                            width={56}
                            height={56}
                            src={testimonial.image}
                            alt={testimonial.author}
                            className="rounded-full object-cover border-2 border-[#ce4646]/20 shadow-md"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{testimonial.author}</p>
                          <p className="text-sm font-medium text-muted-foreground">
                            {testimonial.role}
                          </p>
                          <p className="text-sm font-semibold text-[#ce4646]">
                            {testimonial.company}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-12 md:py-24 relative overflow-hidden">
        <AnimatedSection className="container mx-auto px-4 md:px-6 relative z-10" direction="up">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl text-[#ce4646] font-bold mb-4 drop-shadow-sm">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-lg">
              Find answers to common questions about our platform
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full bg-zinc-900/40 rounded-xl border border-zinc-800/60 p-4 shadow-xl backdrop-blur-sm">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-zinc-800/60">
                  <AccordionTrigger className="text-left font-semibold text-zinc-200 hover:text-[#ce4646] transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-400 leading-relaxed text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </AnimatedSection>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-[#0e0b0d] pb-12">
        <AnimatedSection className="mx-auto py-24 bg-gradient-to-b from-zinc-900/50 to-black rounded-3xl border border-zinc-800/80 shadow-[0_0_50px_rgba(206,70,70,0.15)] relative overflow-hidden max-w-6xl" direction="up" delay={0.2}>
          <div className="absolute inset-0 bg-[#ce4646]/5 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
          <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-3xl mx-auto px-4 relative z-10">
            <h2 className="text-3xl text-[#ce4646] font-black tracking-tight sm:text-4xl md:text-6xl drop-shadow-md">
              Ready to Accelerate Your Career?
            </h2>
            <p className="mx-auto max-w-[650px] text-zinc-300 md:text-xl font-medium leading-relaxed">
              Join thousands of professionals who are advancing their careers
              with AI-powered guidance.
            </p>
            <Link href="/dashboard" passHref className="mt-8 relative inline-block group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#ce4646] to-[#af3333] rounded-lg blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
              <Button
                size="lg"
                className="relative bg-[#ce4646] hover:bg-[#af3333] text-zinc-50 h-14 px-8 text-lg font-bold rounded-lg shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Start Your Journey Today <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </AnimatedSection>
      </section>
    </>
  );
}
