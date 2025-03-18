"use client";

import { useState, useRef, useEffect } from "react";
import { useReactMediaRecorder } from "react-media-recorder";

type RecorderProps = {
  onRecordingComplete: (blobUrl: string | null) => void;
};

const Recorder = ({ onRecordingComplete }: RecorderProps) => {
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ video: true, audio: true });

  const [timeLeft, setTimeLeft] = useState(45);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopRecording();
          clearInterval(timerRef.current!);
          return 45;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStart = () => {
    startRecording();
    startTimer();
  };

  const handleStop = () => {
    stopRecording();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimeLeft(45);
  };

  useEffect(() => {
    if (status === "stopped" && mediaBlobUrl) {
      onRecordingComplete(mediaBlobUrl);
    }
  }, [status, mediaBlobUrl, onRecordingComplete]);

  return (
    <div>
      <p>Status: {status}</p>
      {status !== "recording" ? (
        <button onClick={handleStart}>Start Recording</button>
      ) : (
        <div>
          <button onClick={handleStop}>Stop Recording</button>
          <p>Time left: {timeLeft} seconds</p>
        </div>
      )}
    </div>
  );
};

export default Recorder;