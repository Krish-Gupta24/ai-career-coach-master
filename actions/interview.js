"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
      skills: true,
    },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
Generate EXACTLY 10 technical interview MCQs for ${user.industry} ${
    user.skills?.length ? `with skills in ${user.skills.join(", ")}` : ""
  }.

STRICT RULES:
- You MUST return exactly 10 questions (not less, not more)
- Each question must have exactly 4 options
- The correctAnswer must match one of the options EXACTLY
- Return ONLY valid JSON (no markdown, no explanation)

FORMAT:
{
  "questions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "string",
      "explanation": "string"
    }
  ]
}
`;

  let quiz = null;

  // 🔁 Retry logic (2 attempts)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
      });

      let text = response.choices[0]?.message?.content || "";

      // 🧹 Clean markdown
      text = text.replace(/```json|```/g, "").trim();

      const parsed = JSON.parse(text);

      if (parsed.questions && parsed.questions.length === 10) {
        quiz = parsed.questions;
        break;
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error.message);
    }
  }

  // ❌ If still failed → fallback
  if (!quiz) {
    console.warn("Using fallback quiz");

    return [
      {
        question: "What is a closure in JavaScript?",
        options: [
          "A function with access to its outer scope",
          "A loop structure",
          "A database connection",
          "A CSS property",
        ],
        correctAnswer: "A function with access to its outer scope",
        explanation:
          "Closures allow functions to retain access to variables from their lexical scope.",
      },
      {
        question: "What does '===' mean in JavaScript?",
        options: [
          "Assignment",
          "Loose equality",
          "Strict equality",
          "Inequality",
        ],
        correctAnswer: "Strict equality",
        explanation:
          "=== checks both value and type, unlike == which performs type coercion.",
      },
    ];
  }

  return quiz;
}

export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  let improvementTip = null;

  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`,
      )
      .join("\n\n");

    const improvementPrompt = `
The user got the following ${user.industry} questions wrong:

${wrongQuestionsText}

Give a short improvement tip (max 2 sentences).
Focus on what to learn next.
`;

    try {
      const response = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        messages: [{ role: "user", content: improvementPrompt }],
      });

      improvementTip = response.choices[0]?.message?.content?.trim() || null;
    } catch (error) {
      console.error("Tip generation failed:", error.message);
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    return await db.assessment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}
