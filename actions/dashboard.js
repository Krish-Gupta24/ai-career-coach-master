"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const generateAIInsights = async (industry) => {
  const prompt = `
Analyze the current state of the ${industry} industry and return ONLY valid JSON:

{
  "salaryRanges": [
    { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
  ],
  "growthRate": number,
  "demandLevel": "High" | "Medium" | "Low",
  "topSkills": ["skill1", "skill2"],
  "marketOutlook": "Positive" | "Neutral" | "Negative",
  "keyTrends": ["trend1", "trend2"],
  "recommendedSkills": ["skill1", "skill2"]
}

Rules:
- No markdown
- No explanation
- Valid JSON only
`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    let text = response.choices[0]?.message?.content || "";

    // 🧹 Clean AI garbage
    text = text.replace(/```json|```/g, "").trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("Groq JSON failed:", error.message);

    // ✅ fallback (CRITICAL)
    return {
      salaryRanges: [
        {
          role: "Software Engineer",
          min: 400000,
          max: 1200000,
          median: 800000,
          location: "India",
        },
      ],
      growthRate: 12,
      demandLevel: "High",
      topSkills: ["JavaScript", "React", "Node.js", "SQL", "Git"],
      marketOutlook: "Positive",
      keyTrends: ["AI integration", "Remote work", "Cloud adoption"],
      recommendedSkills: ["DSA", "System Design", "Backend", "DevOps"],
    };
  }
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // If no insights exist, generate them
  if (!user.industryInsight) {
    const insights = await generateAIInsights(user.industry);

    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return industryInsight;
  }

  return user.industryInsight;
}
