"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const ReviewPage = () => {
  const router = useRouter();
  const { videoUrl } = router.query || {};
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!videoUrl) return;

    setUploading(true);
    try {
      // Fetch signed upload URL from API
      const res = await fetch("/api/get-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "anonymous" }), // Placeholder userId
      });
      const { url } = await res.json();

      // Fetch the video blob from the URL
      const response = await fetch(videoUrl as string);
      const videoBlob = await response.blob();

      // Upload to Mux
      await fetch(url, {
        method: "PUT",
        body: videoBlob,
      });

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
      <video src={videoUrl as string} controls width="100%" />
      <button onClick={() => router.push("/record")}>Re-record</button>
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default ReviewPage;