"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useReactMediaRecorder } from "react-media-recorder";

const RecordPage = () => {
  const router = useRouter();
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ video: true });

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
      router.push(`/review?videoUrl=${encodeURIComponent(mediaBlobUrl)}`);
    }
  }, [status, mediaBlobUrl, router]);

  return (
    <div>
      <h1>Record Your Video</h1>
      <p>Answer these questions (45 seconds max):</p>
      <ul>
        <li>What’s your favorite Disney character?</li>
        <li>If you could master one skill instantly, what would it be and why?</li>
        <li>What’s your favorite way to spend a free afternoon?</li>
      </ul>
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

export default RecordPage;