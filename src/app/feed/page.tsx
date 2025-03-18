"use client";

import { useEffect, useState, useRef } from "react";
import Hls from "hls.js";

const FeedPage = () => {
  const [videos, setVideos] = useState<string[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    fetch("/api/get-feed")
      .then((res) => {
        console.log("Response Status:", res.status);
        console.log("Response OK:", res.ok);
        return res.text();
      })
      .then((text) => {
        console.log("Raw Response:", text);
        const data = JSON.parse(text);
        setVideos(data.map((v: any) => v.playbackUrl));
      })
      .catch((err) => console.error("Fetch Error:", err));
  }, []);

  useEffect(() => {
    videos.forEach((url, index) => {
      const video = videoRefs.current[index];
      if (video && Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log(`HLS ready for video ${index}`);
        });
      } else if (video && video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url; // Native HLS support (e.g., Safari)
      }
    });
  }, [videos]);

  return (
    <div>
      <h1>Video Feed</h1>
      {videos.length === 0 ? (
        <p>No videos yet</p>
      ) : (
        videos.map((url, index) => (
          <video
            key={index}
            ref={(el) => (videoRefs.current[index] = el)}
            controls
            width="100%"
          />
        ))
      )}
    </div>
  );
};

export default FeedPage;