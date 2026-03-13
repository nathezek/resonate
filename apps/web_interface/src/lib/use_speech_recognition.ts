import { useEffect, useRef, useState, useCallback, useMemo } from "react";

type SpeechRecognitionHookProps = {
    onInterim?: (text: string) => void;
    onFinal?: (text: string) => void;
    onSilenceStart?: () => void;
    onError?: (error: string) => void;
    onEnd?: () => void;
    language?: string; // default 'en-US'
};

export function useSpeechRecognition({
    onInterim,
    onFinal,
    onSilenceStart,
    onError,
    onEnd,
    language = "en-US",
}: SpeechRecognitionHookProps = {}) {
    // 1. Identify constructor outside of render/effect to avoid "impure" warnings
    const SpeechRecognitionConstructor =
        typeof window !== "undefined"
            ? window.SpeechRecognition || window.webkitSpeechRecognition
            : null;

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const [isSupported] = useState(!!SpeechRecognitionConstructor);
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(
        !SpeechRecognitionConstructor
            ? "Speech Recognition is not supported in this browser."
            : null,
    );

    // 2. Initialize with 0 to remain idempotent during render
    const lastSoundTimeRef = useRef<number>(0);

    const onInterimRef = useRef(onInterim);
    const onFinalRef = useRef(onFinal);
    const onSilenceStartRef = useRef(onSilenceStart);
    const onErrorRef = useRef(onError);
    const onEndRef = useRef(onEnd);

    useEffect(() => {
        onInterimRef.current = onInterim;
        onFinalRef.current = onFinal;
        onSilenceStartRef.current = onSilenceStart;
        onErrorRef.current = onError;
        onEndRef.current = onEnd;
    });

    // Use useCallback for start/stop so they are stable references
    const start = useCallback(() => {
        if (!recognitionRef.current || isListening) return;
        try {
            recognitionRef.current.start();
            setIsListening(true);
            setError(null);
            lastSoundTimeRef.current = Date.now();
        } catch (err) {
            setError((err as Error).message || "Failed to start recognition");
        }
    }, [isListening]);

    const stop = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    useEffect(() => {
        if (!SpeechRecognitionConstructor) return;

        const recognition = new SpeechRecognitionConstructor();
        recognitionRef.current = recognition;

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const results = Array.from(event.results);
            const transcript = results
                .map((result) => result[0].transcript)
                .join("");

            const isFinal = event.results[event.results.length - 1].isFinal;

            if (isFinal) {
                onFinalRef.current?.(transcript);
            } else {
                onInterimRef.current?.(transcript);
            }

            lastSoundTimeRef.current = Date.now();
        };

        recognition.onaudioend = () => {
            const timeSinceLastSound = Date.now() - lastSoundTimeRef.current;
            if (timeSinceLastSound > 800) {
                onSilenceStartRef.current?.();
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            // Note: 'no-speech' is a common error that doesn't necessarily mean failure
            setError(event.error);
            onErrorRef.current?.(event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
            onEndRef.current?.();
        };

        return () => {
            recognition.stop();
            recognitionRef.current = null;
        };
    }, [language, SpeechRecognitionConstructor]);

    return useMemo(() => ({
        isSupported,
        isListening,
        error,
        start,
        stop,
        pause: stop,
        resume: start,
    }), [isSupported, isListening, error, start, stop]);
}
