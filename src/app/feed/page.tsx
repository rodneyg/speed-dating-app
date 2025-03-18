"use client";

import { useEffect, useState, useRef } from "react";
import Hls from "hls.js";

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

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/get-feed");
      
      if (!res.ok) {
        throw new Error(`Failed to fetch videos: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Videos received:", data);
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
    
    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      console.log("Auto-refreshing feed...");
      fetchVideos();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    if (videos.length > 0) {
      videos.forEach((video, index) => {
        const videoElement = videoRefs.current[index];
        if (!videoElement) return;
        
        if (Hls.isSupported()) {
          const hls = new Hls({ 
            enableWorker: true,
            lowLatencyMode: true,
            debug: false 
          });
          
          hls.loadSource(video.playbackUrl);
          hls.attachMedia(videoElement);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log(`HLS manifest parsed for video ${index}`);
            videoElement.play().catch(e => console.log("Auto-play prevented:", e));
          });
          
          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error(`HLS error for video ${index}:`, data);
            if (data.fatal) {
              switch(data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.log("Network error, trying to recover...");
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log("Media error, trying to recover...");
                  hls.recoverMediaError();
                  break;
                default:
                  console.log("Fatal error, cannot recover");
                  hls.destroy();
                  break;
              }
            }
          });
          
        } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
          // For Safari which has built-in HLS support
          videoElement.src = video.playbackUrl;
        }
      });
    }
  }, [videos]);

  const handleManualRefresh = () => {
    fetchVideos();
  };

  return (
    <div style={{ 
      maxWidth: "600px", 
      margin: "0 auto", 
      padding: "20px" 
    }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "20px" 
      }}>
        <h1 style={{ fontSize: "24px" }}>Video Feed</h1>
        <button 
          onClick={handleManualRefresh}
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      
      {loading && <p>Loading videos...</p>}
      
      {error && (
        <div style={{ 
          padding: "10px", 
          backgroundColor: "#ffdddd", 
          border: "1px solid #ff0000",
          borderRadius: "4px",
          marginBottom: "20px"
        }}>
          {error}
        </div>
      )}
      
      {!loading && !error && videos.length === 0 && (
        <p>No videos available yet. Be the first to upload!</p>
      )}
      
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {videos.map((video, index) => (
          <div 
            key={video.id} 
            style={{ 
              border: "1px solid #eaeaea",
              borderRadius: "8px",
              overflow: "hidden"
            }}
          >
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              controls
              playsInline
              style={{ 
                width: "100%", 
                height: "auto",
                backgroundColor: "#000",
                display: "block"
              }}
            />
            <div style={{ padding: "10px" }}>
              <p style={{ fontSize: "12px", color: "#666" }}>
                Uploaded: {new Date(video.uploadDate).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedPage;