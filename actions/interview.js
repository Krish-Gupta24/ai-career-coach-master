"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

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
- Every question MUST include "explanation": a non-empty string (2–4 sentences) teaching why the correct option is right
- Return ONLY valid JSON (no markdown fences, no text before or after the JSON)

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
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
      });

      let text = response.choices[0]?.message?.content || "";

      // 🧹 Clean markdown
      text = text.replace(/```json|```/g, "").trim();

      const parsed = JSON.parse(text);

      if (parsed.questions && parsed.questions.length === 10) {
        quiz = parsed.questions.map((q) => ({
          ...q,
          explanation:
            q.explanation && String(q.explanation).trim()
              ? String(q.explanation).trim()
              : "",
        }));
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

/**
 * Personalized explanation for the candidate's chosen answer (during or after quiz).
 */
export async function explainQuizAnswer({
  question,
  options,
  correctAnswer,
  userAnswer,
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const isCorrect = userAnswer === correctAnswer;
  const opts = Array.isArray(options) ? options : [];
  const optionsText = opts.length ? opts.join("\n") : "(options not listed)";

  const prompt = `You are a supportive technical interview coach.

Multiple-choice question:
${question}

Options:
${optionsText}

Correct answer: ${correctAnswer}
Candidate chose: ${userAnswer}
Outcome: ${isCorrect ? "CORRECT" : "INCORRECT"}

Write a clear explanation in plain text (2–4 short sentences, no markdown, no bullets):
${
  isCorrect
    ? "Affirm why their answer is right and add one memorable takeaway or related pitfall to watch for."
    : "Explain why the correct answer is right, gently address why their choice may be tempting or wrong, and what concept to review — encouraging tone."
}`;

  try {
    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    const text = response.choices[0]?.message?.content?.trim() || "";
    if (!text) throw new Error("Empty explanation");
    return text;
  } catch (error) {
    console.error("explainQuizAnswer:", error?.message || error);
    throw new Error("Failed to generate explanation");
  }
}

async function batchFillMissingExplanations(questionResults) {
  const missingIdx = questionResults
    .map((r, i) => (!r.explanation || !String(r.explanation).trim() ? i : null))
    .filter((i) => i !== null);

  if (missingIdx.length === 0) return questionResults;

  const blocks = missingIdx
    .map((i, n) => {
      const r = questionResults[i];
      return `### Item ${n + 1}
Question: ${r.question}
Correct answer: ${r.answer}
Candidate answered: ${r.userAnswer}
Result: ${r.isCorrect ? "CORRECT" : "INCORRECT"}`;
    })
    .join("\n\n");

  const prompt = `You are a technical interview coach. For each ITEM below, write one explanation string (2-3 sentences, plain text, no markdown).

Return ONLY valid JSON in this exact shape:
{"explanations": ["...", "..."]}

The explanations array MUST have exactly ${missingIdx.length} strings in the same order as items (Item 1 → index 0, etc.).

${blocks}`;

  try {
    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    let text = response.choices[0]?.message?.content || "";
    text = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    const list = parsed.explanations;
    if (!Array.isArray(list) || list.length !== missingIdx.length) {
      throw new Error("Bad explanations shape");
    }

    const next = [...questionResults];
    missingIdx.forEach((origIndex, n) => {
      const ex = list[n];
      if (ex && String(ex).trim()) {
        next[origIndex] = { ...next[origIndex], explanation: String(ex).trim() };
      }
    });
    return next;
  } catch (error) {
    console.error("batchFillMissingExplanations:", error?.message || error);
    return questionResults.map((r) => ({
      ...r,
      explanation:
        r.explanation?.trim() ||
        (r.isCorrect
          ? "Nice work — review the question text to reinforce the underlying concept."
          : `The correct answer is: ${r.answer}. Review this topic and try a similar question again.`),
    }));
  }
}

export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  let questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation && String(q.explanation).trim() ? q.explanation : "",
  }));

  questionResults = await batchFillMissingExplanations(questionResults);

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
        model: GROQ_MODEL,
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
