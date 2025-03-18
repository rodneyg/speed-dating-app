"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const ReviewPage = () => {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const url = localStorage.getItem("recordedVideoUrl");
    setVideoUrl(url);
  }, []);

  const handleUpload = async () => {
    if (!videoUrl) return;

    setUploading(true);
    try {
      const res = await fetch("/api/get-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "anonymous" }),
      });
      if (!res.ok) throw new Error("Failed to get upload URL");

      const { url, uploadId } = await res.json();

      const response = await fetch(videoUrl);
      const videoBlob = await response.blob();

      const uploadResponse = await fetch(url, {
        method: "PUT",
        body: videoBlob,
      });
      if (!uploadResponse.ok) throw new Error("Failed to upload video to Mux");

      console.log("Video uploaded successfully");

      const completeRes = await fetch("/api/upload-completed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId }),
      });
      if (!completeRes.ok) console.warn("Upload completion notification failed");

      router.push("/feed");
    } catch (error) {
      console.error("Upload failed:", error);
      setUploading(false);
    }
  };

  if (!videoUrl)
    return (
      <div
        style={{
          maxWidth: "320px",
          margin: "0 auto",
          padding: "20px",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "18px", color: "#666" }}>No video found</p>
      </div>
    );

  return (
    <div
      style={{
        maxWidth: "320px",
        margin: "0 auto",
        padding: "20px",
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "28px",
          fontWeight: "700",
          color: "#1a237e",
          textAlign: "center",
          marginBottom: "0",
        }}
      >
        Review Your Video
      </h1>
      <video
        src={videoUrl}
        controls
        style={{
          width: "100%",
          maxHeight: "360px",
          borderRadius: "8px",
          backgroundColor: "#000",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
        }}
      >
        <button
          onClick={() => router.push("/record")}
          style={{
            flex: 1,
            padding: "12px",
            fontSize: "16px",
            fontWeight: "600",
            color: "#388e3c",
            backgroundColor: "#e8f5e9",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#c8e6c9")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#e8f5e9")}
        >
          Re-record
        </button>
        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{
            flex: 1,
            padding: "12px",
            fontSize: "16px",
            fontWeight: "600",
            color: "white",
            backgroundColor: uploading ? "#b0bec5" : "#0288d1",
            border: "none",
            borderRadius: "8px",
            cursor: uploading ? "not-allowed" : "pointer",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) =>
            !uploading && (e.target.style.backgroundColor = "#0277bd")
          }
          onMouseOut={(e) =>
            !uploading && (e.target.style.backgroundColor = "#0288d1")
          }
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
      {uploading && (
        <div
          style={{
            textAlign: "center",
            padding: "10px",
            backgroundColor: "#e0f7fa",
            borderRadius: "8px",
            color: "#0288d1",
          }}
        >
          <p style={{ fontSize: "16px", margin: "0" }}>
            Uploading your video... Please wait a moment.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewPage;