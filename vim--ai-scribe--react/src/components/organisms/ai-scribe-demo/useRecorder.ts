import { useCallback } from "react";
import { useState, useEffect } from "react";
import { useVimOsContext } from "@/providers/VimOSContext";

export const useRecorder = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const vimOS = useVimOsContext();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime((time) => time + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const simulateRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(stream);
      // Show the VimOS microphone badge to indicate active recording
      vimOS?.hub?.microphoneBadge?.show?.();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
    } catch {
      // Hide the badge if access is denied or an error occurs
      vimOS?.hub?.microphoneBadge?.hide?.();
      console.error("Microphone access denied or error occurred.");
    }
  }, [vimOS]);

  const stopRecording = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    // Hide the VimOS microphone badge when recording stops
    vimOS?.hub?.microphoneBadge?.hide?.();
  }, [vimOS, stream]);

  return {
    isPaused,
    setIsPaused,
    isRecording,
    setIsRecording,
    recordingTime,
    simulateRecording,
    stopRecording,
  };
};
