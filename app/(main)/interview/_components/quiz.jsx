"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  generateQuiz,
  saveQuizResult,
  explainQuizAnswer,
} from "@/actions/interview";
import QuizResult from "./quiz-result";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  /** Per-question AI explanations keyed by index (tailored to user's chosen option) */
  const [explanationsByIdx, setExplanationsByIdx] = useState({});
  const [explanationLoading, setExplanationLoading] = useState(false);

  const {
    loading: generatingQuiz,
    fn: generateQuizFn,
    data: quizData,
  } = useFetch(generateQuiz);

  const {
    loading: savingResult,
    fn: saveQuizResultFn,
    data: resultData,
    setData: setResultData,
  } = useFetch(saveQuizResult);

  useEffect(() => {
    if (quizData) {
      setAnswers(new Array(quizData.length).fill(null));
    }
  }, [quizData]);

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
    setExplanationsByIdx((prev) => {
      const next = { ...prev };
      delete next[currentQuestion];
      return next;
    });
    setShowExplanation(false);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const handleShowExplanation = async () => {
    const idx = currentQuestion;
    const q = quizData[idx];
    const userAns = answers[idx];
    if (!userAns) return;

    if (explanationsByIdx[idx]) {
      setShowExplanation(true);
      return;
    }

    setExplanationLoading(true);
    try {
      const text = await explainQuizAnswer({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: userAns,
      });
      setExplanationsByIdx((prev) => ({ ...prev, [idx]: text }));
      setShowExplanation(true);
    } catch {
      toast.error("Could not generate explanation. Try again.");
      const fallback =
        q.explanation?.trim() ||
        "Select an answer and try again, or finish the quiz to see saved explanations.";
      setExplanationsByIdx((prev) => ({ ...prev, [idx]: fallback }));
      setShowExplanation(true);
    } finally {
      setExplanationLoading(false);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === quizData[index].correctAnswer) {
        correct++;
      }
    });
    return (correct / quizData.length) * 100;
  };

  const finishQuiz = async () => {
    const score = calculateScore();
    const enrichedQuestions = quizData.map((q, i) => ({
      ...q,
      explanation:
        explanationsByIdx[i]?.trim() || q.explanation?.trim() || "",
    }));
    try {
      await saveQuizResultFn(enrichedQuestions, answers, score);
      toast.success("Quiz completed!");
    } catch (error) {
      toast.error(error.message || "Failed to save quiz results");
    }
  };

  const startNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    setExplanationsByIdx({});
    generateQuizFn();
    setResultData(null);
  };

  if (generatingQuiz) {
    return <BarLoader className="mt-4" width={"100%"} color="gray" />;
  }

  // Show results if quiz is completed
  if (resultData) {
    return (
      <div className="mx-2">
        <QuizResult result={resultData} onStartNew={startNewQuiz} />
      </div>
    );
  }

  if (!quizData) {
    return (
      <Card className="mx-2">
        <CardHeader>
          <CardTitle>Ready to test your knowledge?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This quiz contains 10 questions specific to your industry and
            skills. Take your time and choose the best answer for each question.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={generateQuizFn} className="w-full">
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const question = quizData[currentQuestion];

  return (
    <Card className="mx-2">
      <CardHeader>
        <CardTitle>
          Question {currentQuestion + 1} of {quizData.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-medium">{question.question}</p>
        <RadioGroup
          onValueChange={handleAnswer}
          value={answers[currentQuestion]}
          className="space-y-2"
        >
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>

        {showExplanation && (
          <div className="mt-4 rounded-lg border bg-muted/60 p-4">
            <p className="font-medium">Explanation</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {explanationsByIdx[currentQuestion] ||
                question.explanation ||
                "No explanation available."}
            </p>
          </div>
        )}
        {explanationLoading && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <BarLoader width={120} height={4} color="gray" />
            <span>Generating explanation…</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {!showExplanation && (
          <Button
            onClick={handleShowExplanation}
            variant="outline"
            disabled={!answers[currentQuestion] || explanationLoading}
          >
            {explanationLoading ? "Generating…" : "Show explanation"}
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!answers[currentQuestion] || savingResult}
          className="ml-auto"
        >
          {savingResult && (
            <BarLoader className="mt-4" width={"100%"} color="gray" />
          )}
          {currentQuestion < quizData.length - 1
            ? "Next Question"
            : "Finish Quiz"}
        </Button>
      </CardFooter>
    </Card>
  );
}
