"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function FeatureCard({ feature }) {
  return (
    <Card
      className="relative overflow-hidden border-2 transition-all duration-300 cursor-pointer 
      hover:border-[#ce4646] group hover:scale-[1.02]"
    >
      {/* 🔥 glow layer */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_var(--x)_var(--y),rgba(206,70,70,0.25),transparent_40%)]" />
      </div>

      <CardContent
        className="pt-6 text-center flex flex-col items-center relative z-10"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty(
            "--x",
            `${e.clientX - rect.left}px`,
          );
          e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
        }}
      >
        <div className="flex flex-col items-center justify-center">
          {feature.icon}

          <h3 className="text-xl font-bold mb-2">{feature.title}</h3>

          <p className="text-muted-foreground">{feature.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
