"use client";

import { useRef, useEffect, useMemo, useLayoutEffect } from "react";
import { useReactMediaRecorder } from "react-media-recorder";

type RecorderProps = {
  onRecordingComplete: (blobUrl: string | null) => void;
};

const Recorder = ({ onRecordingComplete }: RecorderProps) => {
  const { status, startRecording, stopRecording, mediaBlobUrl, previewStream, error } =
    useReactMediaRecorder({ video: true, audio: true });
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const videoElement = useMemo(
    () => (
      <video
        ref={videoRef}
        style={{
          display: status === "recording" ? "block" : "none",
          width: "100%",
          maxHeight: "240px",
          borderRadius: "8px",
          backgroundColor: "#000",
          objectFit: "cover",
        }}
        muted
        playsInline
        webkit-playsinline="true"
      />
    ),
    [status]
  );

  useEffect(() => {
    if (status === "stopped" && mediaBlobUrl) {
      onRecordingComplete(mediaBlobUrl);
    }
  }, [status, mediaBlobUrl, onRecordingComplete]);

  useLayoutEffect(() => {
    const video = videoRef.current;
    if (video && previewStream && status === "recording") {
      video.srcObject = previewStream;
      video.play().catch((e) => console.log("Preview play error:", e));

      if (video) {
        video.addEventListener("webkitbeginfullscreen", (e) => {
          e.preventDefault();
        });
      }
    } else if (video && video.srcObject) {
      const tracks = video.srcObject as MediaStream;
      tracks.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
    return () => {
      if (video && video.srcObject) {
        const tracks = video.srcObject as MediaStream;
        tracks.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
      }
    };
  }, [previewStream, status]);

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

  if (error) {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          padding: "20px",
          backgroundColor: "#f0f0f0",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          boxSizing: "border-box",
        }}
      >
        <p style={{ color: "#d32f2f", fontSize: "18px" }}>
          Error: {error === "permission_denied" ? "Camera access denied. Please enable it in Settings." : error}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        padding: "20px",
        backgroundColor: "#f0f0f0",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        boxSizing: "border-box",
      }}
    >
      {videoElement}
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
          onClick={startRecording}
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
          onMouseOver={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.backgroundColor = "#2e7d32";
          }}
          onMouseOut={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.backgroundColor = "#388e3c";
          }}
        >
          Start Recording
        </button>
      ) : (
        <button
          onClick={stopRecording}
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
          onMouseOver={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.backgroundColor = "#c62828";
          }}
          onMouseOut={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.backgroundColor = "#d32f2f";
          }}
        >
          Stop Recording
        </button>
      )}
    </div>
  );
};

export default Recorder;