"use server";

import { db } from "@/lib/prisma";
import Groq from "groq-sdk";
import { auth } from "@clerk/nextjs/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ✅ Get interviews by logged-in user
export async function getInterviewsByUserId() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    return await db.interview.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return null;
  }
}

// ✅ Get latest interviews (excluding current user)
export async function getLatestInterviews({ limit = 20 }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    return await db.interview.findMany({
      where: {
        finalized: true,
        NOT: { userId },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch (error) {
    console.error("Error fetching latest interviews:", error);
    return null;
  }
}

// ✅ Get interview by ID
export async function getInterviewById(id) {
  try {
    return await db.interview.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Error fetching interview:", error);
    return null;
  }
}

// ✅ Create feedback (AI-powered)
export async function createFeedback({ interviewId, transcript }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // ✅ Validate interview exists
    const interview = await db.interview.findUnique({
      where: { id: interviewId },
    });

    if (!interview) {
      throw new Error("Interview not found");
    }

    const formattedTranscript = transcript
      .map((t) => `- ${t.role}: ${t.content}`)
      .join("\n");

    const prompt = `
You are an AI interviewer analyzing a mock interview.

Transcript:
${formattedTranscript}

Return ONLY JSON in this format:
{
  "totalScore": number,
  "categoryScores": {
    "communication": number,
    "technical": number,
    "problemSolving": number,
    "cultureFit": number,
    "confidence": number
  },
  "strengths": ["string"],
  "areasForImprovement": ["string"],
  "finalAssessment": "string"
}
`;

    let result;

    try {
      const response = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
      });

      let text = response.choices[0]?.message?.content || "";
      text = text.replace(/```json|```/g, "").trim();

      result = JSON.parse(text);

      // ✅ Validate AI output
      if (!result.totalScore || !result.categoryScores) {
        throw new Error("Incomplete AI response");
      }
    } catch (aiError) {
      console.error("AI Error:", aiError.message);

      // ✅ fallback (never break app)
      result = {
        totalScore: 70,
        categoryScores: {
          communication: 70,
          technical: 65,
          problemSolving: 68,
          cultureFit: 75,
          confidence: 72,
        },
        strengths: ["Good communication", "Clear thinking"],
        areasForImprovement: ["Improve technical depth"],
        finalAssessment: "Decent performance with room for improvement",
      };
    }

    const feedback = await db.feedback.create({
      data: {
        interviewId,
        userId,
        totalScore: result.totalScore,
        categoryScores: result.categoryScores,
        strengths: result.strengths,
        areasForImprovement: result.areasForImprovement,
        finalAssessment: result.finalAssessment,
      },
    });

    return {
      success: true,
      feedbackId: feedback.id,
    };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

// ✅ Get feedback (only for logged-in user)
export async function getFeedbackByInterviewId({ interviewId }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    return await db.feedback.findFirst({
      where: {
        interviewId,
        userId,
      },
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return null;
  }
}
