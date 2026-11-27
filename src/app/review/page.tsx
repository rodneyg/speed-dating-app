"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const ReviewPage = () => {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("none"); // Track the selected filter

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
      const completion = await completeRes.json().catch(() => ({}));
      if (!completeRes.ok) throw new Error(completion.error || "We could not finish processing your video. Please try again.");

      if (completion.status === "processing") {
        setUploadMessage(completion.message || "Your video is still processing. Check back shortly.");
        setUploading(false);
        return;
      }
      router.push("/feed");
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadMessage(error instanceof Error ? error.message : "We could not process your video. Please try again.");
      setUploading(false);
    }
  };

  // Filter options with Instagram-like names
  const filters = [
    { name: "None", value: "none" },
    { name: "Grayscale", value: "grayscale(100%)" },
    { name: "Glow", value: "sepia(80%) brightness(110%)" },
    { name: "Haze", value: "blur(3px) brightness(90%)" },
  ];

  if (!videoUrl)
    return (
      <div
        style={{
          width: "100%",
          padding: "20px",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        <p style={{ fontSize: "18px", color: "#666" }}>No video found</p>
      </div>
    );

  return (
    <div
      style={{
        width: "100%",
        padding: "20px",
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        boxSizing: "border-box",
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
          filter: selectedFilter, // Apply the selected filter to the video preview
        }}
      />
      {/* Filter Selection */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {filters.map((filter) => (
          <button
            key={filter.name}
            onClick={() => setSelectedFilter(filter.value)}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "600",
              color: selectedFilter === filter.value ? "#fff" : "#1a237e",
              backgroundColor: selectedFilter === filter.value ? "#1a237e" : "#e0f7fa",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background-color 0.3s, color 0.3s",
            }}
          >
            {filter.name}
          </button>
        ))}
      </div>
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
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#c8e6c9")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#e8f5e9")}
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
            !uploading && (e.currentTarget.style.backgroundColor = "#0277bd")
          }
          onMouseOut={(e) =>
            !uploading && (e.currentTarget.style.backgroundColor = "#0288d1")
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
      {uploadMessage && (
        <p role="status" style={{ textAlign: "center", color: "#455a64" }}>
          {uploadMessage}
        </p>
      )}
    </div>
  );
};

export default ReviewPage;
