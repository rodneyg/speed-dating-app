"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Hls from "hls.js";
import moment from "moment";
import { useRouter } from "next/navigation";
import { FaHome, FaRedo } from "react-icons/fa";

interface Video {
  id: string;
  playbackUrl: string;
  uploadDate: string;
  userId: string;
}

const FeedPage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Create a properly typed ref callback using useCallback
  const setVideoRef = useCallback((element: HTMLVideoElement | null, index: number) => {
    if (videoRefs.current.length <= index) {
      // Ensure the array has enough slots
      videoRefs.current = [...videoRefs.current, ...Array(index + 1 - videoRefs.current.length).fill(null)];
    }
    videoRefs.current[index] = element;
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/get-feed");
      if (!res.ok) throw new Error(`Failed to fetch videos: ${res.status}`);
      const data = await res.json();
      setVideos(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError("Failed to load videos. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (videos.length > 0) {
      videos.forEach((video, index) => {
        const videoElement = videoRefs.current[index];
        if (!videoElement) return;
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(video.playbackUrl);
          hls.attachMedia(videoElement);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoElement.play().catch((e) => console.log("Auto-play prevented:", e));
          });
        } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
          videoElement.src = video.playbackUrl;
        }
      });
    }
  }, [videos]);

  return (
    <div
      style={{
        height: "100vh",
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
        backgroundColor: "#000",
        width: "100%",
        position: "relative",
      }}
    >
      {/* Refresh Button (Top Right) */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 100,
        }}
      >
        <button 
          onClick={fetchVideos} 
          disabled={loading} 
          aria-label="Refresh"
          style={{
            background: "rgba(0,0,0,0.7)",
            borderRadius: "50%",
            padding: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            cursor: "pointer",
          }}
        >
          <FaRedo size={24} color={loading ? "#666" : "#fff"} />
        </button>
      </div>

      {/* Home Button (Moved Up) */}
      <div
        style={{
          position: "fixed",
          bottom: "80px", // Increased from 20px to avoid controls
          right: "20px",
          zIndex: 100,
        }}
      >
        <button 
          onClick={() => router.push("/")} 
          aria-label="Home"
          style={{
            background: "rgba(0,0,0,0.7)",
            borderRadius: "50%",
            padding: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            cursor: "pointer",
          }}
        >
          <FaHome size={24} color="#fff" />
        </button>
      </div>

      {/* Video Feed */}
      {videos.map((video, index) => (
        <div
          key={video.id}
          style={{
            height: "100vh",
            scrollSnapAlign: "start",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <video
            ref={el => setVideoRef(el, index)}
            controls
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              backgroundColor: "#000",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              background: "rgba(0, 0, 0, 0.7)",
              padding: "8px 12px",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "14px",
              backdropFilter: "blur(4px)",
              maxWidth: "80%",
            }}
          >
            Uploaded {moment(video.uploadDate).fromNow()} by {video.userId}
          </div>
        </div>
      ))}

      {/* Loading/Error States */}
      <div style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 100,
        color: "#fff",
        background: "rgba(0,0,0,0.8)",
        padding: "16px",
        borderRadius: "8px",
        display: (loading || error) ? "block" : "none",
      }}>
        {loading && <p>Loading videos...</p>}
        {error && <p>{error}</p>}
      </div>
    </div>
  );
};

export default FeedPage;