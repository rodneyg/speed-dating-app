"use client";

import { useEffect, useState } from "react";

const FeedPage = () => {
  const [videos, setVideos] = useState<string[]>([]);

  useEffect(() => {
    // Placeholder fetch;
    fetch("/api/get-feed")
      .then((res) => res.json())
      .then((data) => setVideos(data.map((v: any) => v.playbackUrl)))
      .catch((err) => console.error("Failed to fetch feed:", err));
  }, []);

  return (
    <div>
      <h1>Video Feed</h1>
      {videos.length === 0 ? (
        <p>No videos yet</p>
      ) : (
        videos.map((url, index) => (
          <video key={index} src={url} controls width="100%" />
        ))
      )}
    </div>
  );
};

export default FeedPage;