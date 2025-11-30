"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface AudioRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  error: string | null;
}

export interface UseAudioRecordingReturn extends AudioRecordingState {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
  isSupported: boolean;
}

const AUDIO_RECORDING_ENABLED_KEY = "doctor_audio_recording_enabled";

export function getAudioRecordingPreference(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(AUDIO_RECORDING_ENABLED_KEY);
  return stored === null ? true : stored === "true";
}

export function setAudioRecordingPreference(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUDIO_RECORDING_ENABLED_KEY, String(enabled));
}

export function useAudioRecording(): UseAudioRecordingReturn {
  const [state, setState] = useState<AudioRecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);

  const isSupported = typeof window !== "undefined" && 
    "MediaRecorder" in window && 
    navigator.mediaDevices?.getUserMedia !== undefined;

  const updateDuration = useCallback(() => {
    if (!state.isPaused && state.isRecording) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000 + pausedDurationRef.current;
      setState((prev) => ({ ...prev, duration: elapsed }));
    }
  }, [state.isPaused, state.isRecording]);

  useEffect(() => {
    if (state.isRecording && !state.isPaused) {
      timerRef.current = setInterval(updateDuration, 100);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.isRecording, state.isPaused, updateDuration]);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setState((prev) => ({
        ...prev,
        error: "Audio recording is not supported in this browser",
      }));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      // Prefer webm for better compatibility
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setState((prev) => ({
          ...prev,
          audioBlob: blob,
          isRecording: false,
          isPaused: false,
        }));

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setState((prev) => ({
          ...prev,
          error: "Recording error occurred",
          isRecording: false,
        }));
      };

      mediaRecorder.start(1000); // Collect data every second
      startTimeRef.current = Date.now();
      pausedDurationRef.current = 0;

      setState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        audioBlob: null,
        error: null,
      });
    } catch (err: any) {
      console.error("Failed to start recording:", err);
      let errorMessage = "Failed to start recording";
      if (err.name === "NotAllowedError") {
        errorMessage = "Microphone access denied. Please allow microphone access.";
      } else if (err.name === "NotFoundError") {
        errorMessage = "No microphone found. Please connect a microphone.";
      }
      setState((prev) => ({ ...prev, error: errorMessage }));
    }
  }, [isSupported]);

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && state.isRecording) {
        // Update final duration before stopping
        const finalDuration = (Date.now() - startTimeRef.current) / 1000 + pausedDurationRef.current;
        setState((prev) => ({ ...prev, duration: finalDuration }));
        
        // Override onstop to resolve the promise
        const currentMimeType = mediaRecorderRef.current.mimeType;
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: currentMimeType });
          setState((prev) => ({
            ...prev,
            audioBlob: blob,
            isRecording: false,
            isPaused: false,
          }));

          // Stop all tracks
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }
          
          resolve(blob);
        };
        
        mediaRecorderRef.current.stop();
      } else {
        resolve(null);
      }
    });
  }, [state.isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && !state.isPaused) {
      mediaRecorderRef.current.pause();
      pausedDurationRef.current += (Date.now() - startTimeRef.current) / 1000;
      setState((prev) => ({ ...prev, isPaused: true }));
    }
  }, [state.isRecording, state.isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && state.isPaused) {
      mediaRecorderRef.current.resume();
      startTimeRef.current = Date.now();
      setState((prev) => ({ ...prev, isPaused: false }));
    }
  }, [state.isRecording, state.isPaused]);

  const resetRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    chunksRef.current = [];
    mediaRecorderRef.current = null;
    pausedDurationRef.current = 0;
    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      error: null,
    });
  }, [state.isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && state.isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    isSupported,
  };
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
