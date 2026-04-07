"use server";

import { db } from "@/lib/prisma";
import Groq from "groq-sdk";
import { auth } from "@clerk/nextjs/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ✅ Initialize Interview
export async function initializeInterview() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const interview = await db.interview.create({
      data: {
        userId: user.id,
        status: "started",
        type: "mix", // default or vapi
      },
    });

    return { success: true, interviewId: interview.id };
  } catch (error) {
    console.error("Error initializing interview:", error);
    return { success: false, error: error.message };
  }
}

// ✅ Save Transcript Turn
export async function saveTranscriptTurn(interviewId, role, content) {
  try {
    if (!interviewId || !content) return { success: false };

    if (role === "assistant") {
      const count = await db.interviewQuestion.count({
        where: { interviewId }
      });
      await db.interviewQuestion.create({
        data: {
          interviewId,
          questionText: content,
          order: count + 1,
        }
      });
    } else if (role === "user") {
      const latestQuestion = await db.interviewQuestion.findFirst({
        where: { interviewId },
        orderBy: { order: 'desc' }
      });

      if (latestQuestion) {
        await db.interviewAnswer.create({
          data: {
            interviewId,
            questionId: latestQuestion.id,
            answerText: content,
          }
        });
      } else {
        const dummyQ = await db.interviewQuestion.create({
          data: {
            interviewId,
            questionText: "User initiated conversation:",
            order: 0,
          }
        });
        await db.interviewAnswer.create({
          data: {
            interviewId,
            questionId: dummyQ.id,
            answerText: content,
          }
        });
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Error saving transcript turn:", error);
    return { success: false, error: error.message };
  }
}

// ✅ Get interviews by logged-in user (pass internal User.id from getCurrentUser)
export async function getInterviewsByUserId(internalUserId) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId },
    });
    if (!user) return [];
    if (internalUserId != null && internalUserId !== user.id) return [];

    return await db.interview.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return null;
  }
}

// ✅ Get latest interviews (excluding current user)
export async function getLatestInterviews({ limit = 20, userId: internalUserId } = {}) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId },
    });
    if (!user) return [];
    if (internalUserId != null && internalUserId !== user.id) return [];

    return await db.interview.findMany({
      where: {
        finalized: true,
        NOT: { userId: user.id },
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
export async function createFeedback({ interviewId }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const interview = await db.interview.findUnique({
      where: { id: interviewId },
      include: {
        questions: {
          include: {
            answers: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!interview) throw new Error("Interview not found");

    // ✅ STEP 1: Convert DB rows to Q&A
    const qaPairs = interview.questions.map(q => {
      const answerText = q.answers.map(a => a.answerText).join(" ");
      return {
        question: q.questionText,
        answer: answerText || "(No answer provided)"
      };
    });

    // ✅ STEP 2: Generate feedback per question
    const detailedFeedback = await Promise.all(
      qaPairs.map(async (item, index) => {
        try {
          const response = await groq.chat.completions.create({
            model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
            messages: [
              {
                role: "user",
                content: `
Evaluate this interview response.

Question: ${item.question}
Answer: ${item.answer}

Return ONLY JSON:
{
  "feedback": "short feedback",
  "score": number
}
                `,
              },
            ],
          });

          let text = response.choices[0]?.message?.content || "";
          text = text.replace(/```json|```/g, "").trim();

          const parsed = JSON.parse(text);

          return {
            number: index + 1,
            question: item.question,
            answer: item.answer,
            feedback: parsed.feedback,
            score: parsed.score,
          };
        } catch (err) {
          console.log("Per-question AI error:", err.message);

          return {
            number: index + 1,
            question: item.question,
            answer: item.answer,
            feedback: "Decent answer but can improve clarity",
            score: 6,
          };
        }
      }),
    );

    // ✅ STEP 3: Overall summary
    const formattedTranscript = qaPairs.map(qa => `- Interviewer: ${qa.question}\n- You: ${qa.answer}`).join("\n\n");

    let summary;

    try {
      const response = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: `
Analyze this interview transcript:

${formattedTranscript}

Return ONLY JSON:
{
  "totalScore": number,
  "strengths": ["string"],
  "areasForImprovement": ["string"],
  "finalAssessment": "string"
}
            `,
          },
        ],
      });

      let text = response.choices[0]?.message?.content || "";
      text = text.replace(/```json|```/g, "").trim();

      summary = JSON.parse(text);
    } catch {
      summary = {
        totalScore: 70,
        strengths: ["Good communication"],
        areasForImprovement: ["Improve depth"],
        finalAssessment: "Average performance",
      };
    }

    // ✅ STEP 4: Save EVERYTHING
    const feedback = await db.feedback.create({
      data: {
        interviewId,
        userId,
        totalScore: summary.totalScore,
        strengths: summary.strengths,
        areasForImprovement: summary.areasForImprovement,
        finalAssessment: summary.finalAssessment,
        detailedFeedback, // 🔥 IMPORTANT
      },
    });

    // ✅ ALSO update interview
    await db.interview.update({
      where: { id: interviewId },
      data: {
        status: "completed",
        finalized: true,
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
