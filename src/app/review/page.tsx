"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const ReviewPage = () => {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const url = localStorage.getItem("recordedVideoUrl");
    setVideoUrl(url);
  }, []);

  const handleUpload = async () => {
    if (!videoUrl) return;

    setUploading(true);
    try {
      // Step 1: Get the upload URL
      const res = await fetch("/api/get-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "anonymous" }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to get upload URL");
      }
      
      const { url, uploadId } = await res.json();
      
      // Step 2: Upload the video to Mux
      const response = await fetch(videoUrl);
      const videoBlob = await response.blob();
      
      const uploadResponse = await fetch(url, { 
        method: "PUT", 
        body: videoBlob 
      });
      
      if (!uploadResponse.ok) {
        throw new Error("Failed to upload video to Mux");
      }
      
      console.log("Video uploaded successfully");
      
      // Step 3: Notify our backend that the upload is complete
      const completeRes = await fetch("/api/upload-completed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId }),
      });
      
      if (!completeRes.ok) {
        console.warn("Upload completion notification failed, but upload was successful");
      }

      // Step 4: Navigate to the feed page
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
      <div>
        <button onClick={() => router.push("/record")}>Re-record</button>
        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
      {uploading && (
        <div>
          <p>Uploading your video...</p>
          <p>Please be patient. This may take a few moments.</p>
        </div>
      )}
    </div>
  );
};

export default ReviewPage;