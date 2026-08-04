"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PrototypeBrief, type AnalysisData } from "./PrototypeBrief";
import { updateConsultationSession } from "@/lib/actions/consultation";

interface Props {
  sessionId: string;
  initialTranscript?: string;
  initialInsights?: string;
  initialPrototypeHtml?: string;
  companyContext?: string;
}

export function SessionRecorder({
  sessionId,
  initialTranscript,
  initialInsights,
  initialPrototypeHtml,
  companyContext,
}: Props) {
  const router = useRouter();
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState(initialTranscript ?? "");
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(() => {
    if (!initialInsights) return null;
    try {
      const insights = JSON.parse(initialInsights);
      return initialPrototypeHtml
        ? { ...insights, prototypeHtml: initialPrototypeHtml }
        : insights;
    } catch {
      return null;
    }
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transcriptRef = useRef(initialTranscript ?? "");
  const prototypeHtmlRef = useRef(initialPrototypeHtml ?? "");
  const analysisDataRef = useRef<AnalysisData | null>(analysisData);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const analyzeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wantRecordingRef = useRef(false);

  const analyzeTranscript = useCallback(async (): Promise<void> => {
    if (transcriptRef.current.trim().length < 50) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/consultation/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcriptRef.current,
          existingInsights: analysisDataRef.current
            ? JSON.stringify({ ...analysisDataRef.current, prototypeHtml: undefined })
            : "",
          existingHtml: prototypeHtmlRef.current,
          companyContext: companyContext ?? "",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (body?.error && body.error !== "Not enough transcript yet") {
          setError(body.error);
        }
        return;
      }
      const data: AnalysisData = await res.json();
      if (data.prototypeHtml) prototypeHtmlRef.current = data.prototypeHtml;
      analysisDataRef.current = data;
      setAnalysisData(data);
      setError(null);
      await updateConsultationSession(sessionId, {
        transcript: transcriptRef.current,
        insights: JSON.stringify({ ...data, prototypeHtml: undefined }),
        prototypeHtml: data.prototypeHtml,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  }, [sessionId, companyContext]);

  const startRecording = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setError("Speech recognition not supported. Use Chrome or Edge.");
      return;
    }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let newFinal = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          newFinal += event.results[i][0].transcript + " ";
        }
      }
      if (newFinal) {
        transcriptRef.current += newFinal;
        setTranscript(transcriptRef.current);
        if (analyzeTimerRef.current) clearTimeout(analyzeTimerRef.current);
        analyzeTimerRef.current = setTimeout(analyzeTranscript, 20000);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (e: any) => {
      if (e.error === "no-speech") return; // harmless, auto-restarts via onend
      setError(`Mic error: ${e.error}. Check permissions in the browser address bar.`);
      wantRecordingRef.current = false;
      setRecording(false);
    };
    recognition.onend = () => {
      // Chrome stops recognition after ~60s of audio; restart if still wanted
      if (wantRecordingRef.current) {
        try {
          recognition.start();
        } catch {
          setRecording(false);
        }
      } else {
        setRecording(false);
      }
    };
    recognition.start();
    recognitionRef.current = recognition;
    wantRecordingRef.current = true;
    setRecording(true);
    setError(null);
  }, [analyzeTranscript]);

  const stopRecording = useCallback(() => {
    wantRecordingRef.current = false;
    recognitionRef.current?.stop();
    setRecording(false);
    if (analyzeTimerRef.current) clearTimeout(analyzeTimerRef.current);
    void analyzeTranscript();
  }, [analyzeTranscript]);

  const endMeeting = useCallback(async () => {
    wantRecordingRef.current = false;
    recognitionRef.current?.stop();
    setRecording(false);
    if (analyzeTimerRef.current) clearTimeout(analyzeTimerRef.current);
    // Final analysis pass so the prototype reflects the full meeting
    if (transcriptRef.current.trim().length >= 50) {
      await analyzeTranscript();
    }
    await updateConsultationSession(sessionId, {
      transcript: transcriptRef.current,
      status: "COMPLETED",
    });
    router.push(`/consultation/${sessionId}/brief`);
  }, [sessionId, analyzeTranscript, router]);

  return (
    <div className="flex gap-6 h-[calc(100vh-160px)] overflow-hidden">
      {/* Left: Transcript */}
      <div className="w-1/2 flex flex-col gap-3">
        <div className="bg-bg-secondary border border-c-border rounded-lg p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                recording
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gold hover:bg-gold-bright text-bg-primary"
              }`}
            >
              {recording ? "Pause" : "Start Recording"}
            </button>
            {recording && (
              <span className="flex items-center gap-1.5 text-xs text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <button
            onClick={endMeeting}
            disabled={analyzing}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald hover:bg-emerald-bright text-text-primary transition-colors disabled:opacity-60"
          >
            {analyzing ? "Finalizing..." : "End Meeting + Show Prototype"}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800/40 rounded-lg px-4 py-2 text-red-400 text-xs shrink-0">
            {error}
          </div>
        )}

        <div className="flex-1 bg-bg-secondary border border-c-border rounded-lg p-4 overflow-y-auto">
          <p className="text-xs text-text-tertiary uppercase tracking-wider font-semibold mb-3">
            Live Transcript
          </p>
          {transcript ? (
            <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">
              {transcript}
            </p>
          ) : (
            <p className="text-text-tertiary text-sm italic">
              {recording
                ? "Listening — client speech appears here. Small talk is filtered out automatically."
                : "Click Start Recording. The system separates conversation from business content automatically."}
            </p>
          )}
        </div>
      </div>

      {/* Right: Live Prototype */}
      <div className="w-1/2 overflow-y-auto">
        <p className="text-xs text-text-tertiary uppercase tracking-wider font-semibold mb-1">
          Live Prototype
        </p>
        <p className="text-text-tertiary text-xs mb-3">
          Builds from business talk only. Updates 20 seconds after new speech.
        </p>
        <PrototypeBrief data={analysisData} analyzing={analyzing} />
      </div>
    </div>
  );
}
