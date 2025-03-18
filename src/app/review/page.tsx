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
      const { url } = await res.json();

      const response = await fetch(videoUrl);
      const videoBlob = await response.blob();

      await fetch(url, { method: "PUT", body: videoBlob });

      router.push("/feed");
    } catch (error) {
      console.error("Upload failed:", error);
      setUploading(false);
    }
  };

  if (!videoUrl) return <p>No video found</p>;

  return (
    <div>
      <h1>Review Your Video</h1>
      <video src={videoUrl} controls width="100%" />
      <button onClick={() => router.push("/record")}>Re-record</button>
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default ReviewPage;