import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/prisma";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request) {
  const { type, role, level, techstack, amount } = await request.json();

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const { text: questionsText } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
      `,
    });

    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(questionsText);
    } catch {
      throw new Error("Invalid AI response format");
    }

    const interview = await db.interview.create({
      data: {
        role,
        type,
        level,
        techstack: techstack.split(",").map((s) => s.trim()),
        questions: parsedQuestions,
        userId,
        finalized: true,
        coverImage: getRandomInterviewCover(),
      },
    });

    return Response.json(
      { success: true, interviewId: interview.id },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
