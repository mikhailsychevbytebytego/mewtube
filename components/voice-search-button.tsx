"use client";

import { useEffect, useRef, useState } from "react";
import { MicIcon } from "@/components/icons";

type Availability = "available" | "downloading" | "downloadable" | "unavailable";

type SpeechRecognitionOptions = {
  langs: string[];
  processLocally?: boolean;
  quality?: "command" | "dictation" | "conversation";
};

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResultEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionSession extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  processLocally: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionSession;
  available?: (options: SpeechRecognitionOptions) => Promise<Availability>;
  install?: (options: SpeechRecognitionOptions) => Promise<boolean>;
}

type Phase = "idle" | "preparing" | "listening";

function speechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const host = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return host.SpeechRecognition ?? host.webkitSpeechRecognition ?? null;
}

function spokenQuery(results: SpeechRecognitionResultList) {
  let text = "";
  for (let index = 0; index < results.length; index += 1) {
    text += results[index]?.[0]?.transcript ?? "";
  }
  return text.replace(/\s+/g, " ").trim().replace(/\.+$/, "");
}

function voiceSearchError(error: string) {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "Allow the microphone to search by voice.";
    case "language-not-supported":
      return "Voice search isn't available for this language.";
    case "network":
      return "Voice search needs a network connection.";
    case "audio-capture":
      return "No microphone was found.";
    default:
      return "Voice search didn't work. Try again.";
  }
}

export function VoiceSearchButton({
  onChange,
  onCommit,
  className = "size-10",
  wrapperClassName = "",
}: {
  onChange: (transcript: string) => void;
  onCommit: (transcript: string) => void;
  className?: string;
  wrapperClassName?: string;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [notice, setNotice] = useState("");
  const sessionRef = useRef(0);
  const recognitionRef = useRef<SpeechRecognitionSession | null>(null);
  const transcriptRef = useRef("");
  const suppressCommitRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const onCommitRef = useRef(onCommit);
  onChangeRef.current = onChange;
  onCommitRef.current = onCommit;

  useEffect(() => {
    return () => {
      sessionRef.current += 1;
      recognitionRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!notice || phase !== "idle") return;
    const timeout = window.setTimeout(() => setNotice(""), 4000);
    return () => window.clearTimeout(timeout);
  }, [notice, phase]);

  async function listen() {
    const Recognition = speechRecognitionConstructor();
    if (!Recognition) {
      setNotice("Voice search needs a browser with speech recognition.");
      return;
    }

    const session = ++sessionRef.current;
    transcriptRef.current = "";
    suppressCommitRef.current = false;
    setPhase("preparing");
    setNotice("Starting voice search…");

    const lang = navigator.language || "en-US";
    const options: SpeechRecognitionOptions = {
      langs: [lang],
      processLocally: true,
      quality: "command",
    };
    let onDevice = false;

    if (typeof Recognition.available === "function") {
      try {
        const availability = await Recognition.available(options);
        if (session !== sessionRef.current) return;
        if (availability === "available") {
          onDevice = true;
        } else if (
          availability === "downloadable" ||
          availability === "downloading"
        ) {
          setNotice("Downloading on-device speech recognition…");
          if (typeof Recognition.install === "function") {
            onDevice = await Recognition.install(options);
          }
        }
      } catch {
        onDevice = false;
      }
    }

    if (session !== sessionRef.current) return;

    const recognition = new Recognition();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;
    if (onDevice) recognition.processLocally = true;

    recognition.onstart = () => {
      if (session !== sessionRef.current) return;
      setPhase("listening");
      setNotice("Listening…");
    };

    recognition.onresult = (event) => {
      if (session !== sessionRef.current) return;
      const transcript = spokenQuery(event.results);
      transcriptRef.current = transcript;
      if (transcript) onChangeRef.current(transcript);
    };

    recognition.onerror = (event) => {
      if (session !== sessionRef.current) return;
      if (event.error === "aborted" || event.error === "no-speech") return;
      suppressCommitRef.current = true;
      setNotice(voiceSearchError(event.error));
    };

    recognition.onend = () => {
      if (session !== sessionRef.current) return;
      recognitionRef.current = null;
      setPhase("idle");
      const transcript = transcriptRef.current.trim();
      transcriptRef.current = "";
      if (suppressCommitRef.current) {
        suppressCommitRef.current = false;
        return;
      }
      if (transcript) {
        setNotice("");
        onCommitRef.current(transcript);
        return;
      }
      setNotice("Didn't catch that. Try again.");
    };

    recognitionRef.current = recognition;
    setNotice("Allow the microphone, then speak.");

    try {
      recognition.start();
    } catch {
      if (session !== sessionRef.current) return;
      recognitionRef.current = null;
      setPhase("idle");
      setNotice("Tap the microphone again to start.");
    }
  }

  function press() {
    if (phase === "preparing") {
      sessionRef.current += 1;
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      setPhase("idle");
      setNotice("");
      return;
    }

    if (phase === "listening") {
      if (!transcriptRef.current.trim()) suppressCommitRef.current = true;
      recognitionRef.current?.stop();
      return;
    }

    void listen();
  }

  const label =
    phase === "listening"
      ? "Stop voice search"
      : phase === "preparing"
        ? "Cancel voice search"
        : "Voice search";

  return (
    <div className={`relative shrink-0 ${wrapperClassName}`}>
      <button
        type="button"
        onClick={press}
        aria-label={label}
        aria-pressed={phase === "listening"}
        aria-busy={phase === "preparing"}
        className={`grid place-items-center rounded-full ${
          phase === "listening"
            ? "bg-[#ea3323] text-white shadow-[0_0_0_4px_rgba(234,51,35,0.2)]"
            : "bg-chip text-ink hover:bg-hover"
        } ${className}`}
      >
        <MicIcon />
      </button>
      {notice ? (
        <span
          role="status"
          className="absolute top-full right-0 z-30 mt-2 w-56 rounded-lg bg-ink px-3 py-2 text-center text-xs leading-snug text-background shadow-lg"
        >
          {notice}
        </span>
      ) : null}
    </div>
  );
}
