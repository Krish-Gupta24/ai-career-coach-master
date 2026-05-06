export const dynamic = "force-dynamic";

import { getInterviewById } from "@/actions/ai-interview";
import { redirect } from "next/navigation";

const FeedbackPage = async ({ params }) => {
  const id = params?.id;

  if (!id) {
    redirect("/");
  }

  const interview = await getInterviewById(id);

  if (!interview) {
    redirect("/");
  }

  const feedback = interview.feedback || [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Interview Feedback</h1>

      <div className="bg-[#1a1416] p-4 rounded-xl">
        <h2 className="text-xl font-semibold mb-2">Overall Score</h2>

        <p className="text-2xl font-bold text-[#ce4646]">
          {interview.totalScore || "N/A"}
        </p>
      </div>

      {feedback.map((item) => (
        <div
          key={item.number}
          className="bg-[#0e0b0d] border border-[#ce4646]/30 p-5 rounded-xl space-y-3"
        >
          <h3 className="font-semibold text-lg text-[#ce4646]">
            Q{item.number}: {item.question}
          </h3>

          <p>
            <span className="font-semibold">Your Answer:</span> {item.answer}
          </p>

          <p>
            <span className="font-semibold">Feedback:</span> {item.feedback}
          </p>

          <p className="font-semibold">
            Score: <span className="text-[#cdc2a4]">{item.score}/10</span>
          </p>
        </div>
      ))}
    </div>
  );
};

export default FeedbackPage;
