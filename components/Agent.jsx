"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback, initializeInterview, saveTranscriptTurn } from "@/actions/ai-interview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Loader2, Phone, PhoneOff, User } from "lucide-react";

const CallStatus = {
  INACTIVE: "INACTIVE",
  CONNECTING: "CONNECTING",
  ACTIVE: "ACTIVE",
  FINISHED: "FINISHED",
};

const Agent = ({ userName, userId, type, interviewId, questions }) => {
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);
  const [messages, setMessages] = useState([]);
  const transcriptEndRef = useRef(null);
  const interviewIdRef = useRef(interviewId); // Keep track of the active interview ID

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    const onMessage = async (message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          role: message.role,
          content: message.transcript,
        };

        setMessages((prev) => [...prev, newMessage]);

        // Save instantly to database to prevent any data loss
        if (interviewIdRef.current) {
          await saveTranscriptTurn(interviewIdRef.current, message.role, message.transcript);
        }
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    const onError = (error) => console.log("Error", error);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  const handleGenerateFeedback = async () => {
    console.log("Generate feedback here.");
    if (!interviewIdRef.current) {
      router.push("/");
      return;
    }

    const { success, feedbackId: id } = await createFeedback({
      interviewId: interviewIdRef.current,
    });

    if (success && id) {
      router.push(`/interview/${interviewIdRef.current}/feedback`);
    } else {
      console.log("Error saving feedback.");
      router.push("/");
    }
  };

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      handleGenerateFeedback();
    }
  }, [callStatus]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    // CRITICAL: Ensure interview is ALWAYS created before Vapi starts
    if (!interviewIdRef.current) {
      const { success, interviewId: newId, error } = await initializeInterview();
      if (success) {
        interviewIdRef.current = newId;
      } else {
        console.error("Failed to initialize interview", error);
        setCallStatus(CallStatus.INACTIVE);
        return; // Don't start vapi if we can't create DB record
      }
    }

    if (type === "generate") {
      await vapi.start("10bd4b2a-d36f-422f-bab4-2b110ef3f4a5", {
        variableValues: {
          username: userName,
          userid: userId,
        },
      });
    } else {
      let formattedQuestions = "";

      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
    }
  };

  const handleDisconnect = async () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const isCallInactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  const statusLabel =
    callStatus === CallStatus.INACTIVE
      ? "Ready"
      : callStatus === CallStatus.CONNECTING
        ? "Connecting…"
        : callStatus === CallStatus.ACTIVE
          ? "Live"
          : "Ended";

  const statusVariant =
    callStatus === CallStatus.ACTIVE
      ? "default"
      : callStatus === CallStatus.CONNECTING
        ? "secondary"
        : "outline";

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 text-zinc-100 shadow-2xl ring-1 ring-black/5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 bg-black/25 px-4 py-3 md:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-zinc-200">
              AI voice session
            </span>
            <Badge
              variant={statusVariant}
              className={cn(
                callStatus === CallStatus.ACTIVE &&
                  "border-emerald-500/50 bg-emerald-600/90 text-white hover:bg-emerald-600",
                callStatus === CallStatus.CONNECTING &&
                  "border-amber-500/40 bg-amber-500/15 text-amber-200",
              )}
            >
              {callStatus === CallStatus.CONNECTING && (
                <Loader2 className="mr-1 size-3 animate-spin" />
              )}
              {statusLabel}
            </Badge>
            {callStatus === CallStatus.ACTIVE && (
              <span className="flex items-center gap-2 text-xs font-medium text-red-300">
                <span
                  className="size-2 shrink-0 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]"
                  aria-hidden
                />
                On air
              </span>
            )}
          </div>
          {callStatus === CallStatus.ACTIVE && (
            <p className="text-xs text-zinc-500">Captions update as speech is finalized</p>
          )}
        </div>

        <div className="grid min-h-[260px] grid-cols-1 gap-3 p-4 md:min-h-[300px] md:grid-cols-2 md:gap-4 md:p-6">
          <div
            className={cn(
              "relative flex flex-col items-center justify-center rounded-xl border bg-zinc-800/40 p-6 transition-all duration-300 md:p-8",
              isSpeaking && callStatus === CallStatus.ACTIVE
                ? "border-emerald-400/70 shadow-[0_0_32px_rgba(52,211,153,0.2)] ring-2 ring-emerald-400/40"
                : "border-zinc-700/80",
            )}
          >
            <div className="relative mb-4 flex size-24 items-center justify-center rounded-full bg-zinc-900 ring-2 ring-zinc-600 md:size-28">
              <Image
                src="/ai-avatar.png"
                alt=""
                width={88}
                height={88}
                className="size-[72px] rounded-full object-cover md:size-20"
              />
              {isSpeaking && callStatus === CallStatus.ACTIVE && (
                <>
                  <span
                    className="absolute inset-0 rounded-full border-2 border-emerald-400/60 animate-ping"
                    style={{ animationDuration: "1.5s" }}
                    aria-hidden
                  />
                  <span className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="block size-1.5 animate-caption-bar rounded-full bg-emerald-400"
                        style={{ animationDelay: `${i * 0.15}s` }}
                        aria-hidden
                      />
                    ))}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
              <Bot className="size-4 text-emerald-400" aria-hidden />
              AI interviewer
            </div>
            <p className="mt-1 text-center text-xs text-zinc-500">
              {isSpeaking && callStatus === CallStatus.ACTIVE
                ? "Speaking…"
                : callStatus === CallStatus.ACTIVE
                  ? "Listening"
                  : "Waiting to join"}
            </p>
          </div>

          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border border-zinc-700/80 bg-zinc-800/40 p-6 md:p-8",
              callStatus === CallStatus.ACTIVE &&
                !isSpeaking &&
                "ring-1 ring-zinc-600/50",
            )}
          >
            <div className="mb-4 flex size-24 items-center justify-center rounded-full bg-zinc-900 ring-2 ring-zinc-600 md:size-28">
              <Image
                src="/user-avatar.png"
                alt=""
                width={96}
                height={96}
                className="size-[88px] rounded-full object-cover md:size-24"
              />
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
              <User className="size-4 text-sky-400" aria-hidden />
              <span className="max-w-[200px] truncate md:max-w-[240px]">
                {userName || "You"}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">Your line</p>
          </div>
        </div>

        <div className="border-t border-zinc-800 bg-black/55 backdrop-blur-md">
          <div className="px-4 pb-2 pt-3 md:px-6 md:pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Live captions
            </p>
          </div>
          <div className="max-h-[220px] min-h-[100px] space-y-4 overflow-y-auto px-4 pb-4 md:max-h-[260px] md:px-6 md:pb-5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-600">
            {messages.length === 0 ? (
              <p
                className={cn(
                  "py-2 text-center text-sm leading-relaxed text-zinc-500",
                  callStatus === CallStatus.ACTIVE && "text-zinc-400",
                )}
              >
                {callStatus === CallStatus.ACTIVE
                  ? "Listening… captions will appear here as the conversation continues."
                  : callStatus === CallStatus.CONNECTING
                    ? "Connecting to your interviewer…"
                    : "Start the call to see live captions."}
              </p>
            ) : (
              messages.map((m, index) => {
                const isLatest = index === messages.length - 1;
                const isAssistant = m.role === "assistant";
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 md:px-4 md:py-3",
                      isLatest
                        ? "border-zinc-600/90 bg-zinc-900/90"
                        : "border-zinc-800/80 bg-zinc-950/40",
                    )}
                  >
                    <div className="mb-1.5 flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                          isAssistant
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-sky-500/20 text-sky-300",
                        )}
                      >
                        {isAssistant ? "Interviewer" : "You"}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-zinc-100 [text-wrap:pretty]",
                        isLatest
                          ? "text-base font-medium leading-relaxed md:text-lg md:leading-relaxed"
                          : "text-sm leading-relaxed text-zinc-300 md:text-[15px]",
                      )}
                    >
                      {m.content}
                    </p>
                  </div>
                );
              })
            )}
            <div ref={transcriptEndRef} className="h-px shrink-0" aria-hidden />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        {callStatus !== CallStatus.ACTIVE ? (
          <Button
            size="lg"
            className="h-12 min-w-[200px] gap-2 rounded-full bg-emerald-600 text-base font-semibold shadow-lg hover:bg-emerald-700"
            onClick={handleCall}
            disabled={callStatus === CallStatus.CONNECTING}
          >
            {callStatus === CallStatus.CONNECTING ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                <Phone className="size-5" />
                {isCallInactiveOrFinished ? "Start call" : "…"}
              </>
            )}
          </Button>
        ) : (
          <Button
            size="lg"
            variant="destructive"
            className="h-12 min-w-[200px] gap-2 rounded-full text-base font-semibold shadow-lg"
            onClick={handleDisconnect}
          >
            <PhoneOff className="size-5" />
            End call
          </Button>
        )}
      </div>
    </div>
  );
};

export default Agent;
