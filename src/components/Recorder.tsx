"use client";

import { useState, useRef, useEffect } from "react";
import { useReactMediaRecorder } from "react-media-recorder";

type RecorderProps = {
  onRecordingComplete: (blobUrl: string | null) => void;
};

const Recorder = ({ onRecordingComplete }: RecorderProps) => {
  const { status, startRecording, stopRecording, mediaBlobUrl, previewStream } =
    useReactMediaRecorder({ video: true, audio: true });
  const [timeLeft, setTimeLeft] = useState(45);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Timer logic
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

  // Pass completed recording to parent
  useEffect(() => {
    if (status === "stopped" && mediaBlobUrl) {
      onRecordingComplete(mediaBlobUrl);
    }
  }, [status, mediaBlobUrl, onRecordingComplete]);

  // Attach live preview stream to video element
  useEffect(() => {
    if (videoRef.current && previewStream) {
      videoRef.current.srcObject = previewStream;
      videoRef.current.play().catch((e) => console.log("Preview play error:", e));
    }
  }, [previewStream]);

  const getStatusText = (status: string) => {
    switch (status) {
      case "idle":
        return "Ready to record";
      case "acquiring_media":
        return "Accessing camera...";
      case "recording":
        return "Recording...";
      case "stopped":
        return "Recording stopped";
      default:
        return status;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        padding: "20px",
        backgroundColor: "#f0f0f0",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        maxWidth: "320px",
        margin: "0 auto",
      }}
    >
      {status === "recording" && (
        <video
          ref={videoRef}
          style={{
            width: "100%",
            maxHeight: "240px",
            borderRadius: "8px",
            backgroundColor: "#000",
            objectFit: "cover",
          }}
          muted // Mute to avoid feedback loop
        />
      )}
      <p
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          color: status === "recording" ? "#d32f2f" : "#388e3c",
        }}
      >
        {getStatusText(status)}
      </p>
      {status !== "recording" ? (
        <button
          onClick={handleStart}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "600",
            color: "white",
            backgroundColor: "#388e3c",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#2e7d32")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#388e3c")}
        >
          Start Recording
        </button>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <button
            onClick={handleStop}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: "600",
              color: "white",
              backgroundColor: "#d32f2f",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#c62828")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#d32f2f")}
          >
            Stop Recording
          </button>
          <p style={{ fontSize: "16px", color: "#333" }}>
            {timeLeft} seconds left
          </p>
        </div>
      )}
    </div>
  );
};

export default Recorder;