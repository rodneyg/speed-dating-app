"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Hls from "hls.js";
import moment from "moment";
import { useRouter } from "next/navigation";
import { FaHome, FaRedo, FaHeart, FaComment } from "react-icons/fa";

interface Video {
  id: string;
  playbackUrl: string;
  uploadDate: string;
  userId: string;
  likes?: number;
}

interface Comment {
  _id: string;
  text: string;
  videoId: string;
  userId: string;
  createdAt: string;
}

const FeedPage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [cachedVideos, setCachedVideos] = useState<Video[]>([]);
  const [comments, setComments] = useState<{ [videoId: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState<string>("");
  const [showComments, setShowComments] = useState<string | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const touchStartY = useRef<number | null>(null);
  const touchCurrentY = useRef<number>(0);

  // Load cached videos from localStorage on mount
  useEffect(() => {
    const storedVideos = localStorage.getItem("cachedVideos");
    if (storedVideos) {
      const parsedVideos = JSON.parse(storedVideos);
      setCachedVideos(parsedVideos);
      if (!navigator.onLine) {
        setVideos(parsedVideos);
        setError("You are offline. Showing cached videos.");
        setLoading(false);
      }
    }
  }, []);

  const setVideoRef = useCallback((element: HTMLVideoElement | null, index: number) => {
    if (videoRefs.current.length <= index) {
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
      setCachedVideos(data);
      localStorage.setItem("cachedVideos", JSON.stringify(data));
      setError(null);
    } catch (err) {
      console.error("Error fetching videos:", err);
      if (cachedVideos.length > 0) {
        setVideos(cachedVideos);
        setError("You are offline. Showing cached videos.");
      } else {
        setError("Failed to load videos. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (videoId: string) => {
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`);
      if (!res.ok) throw new Error(`Failed to fetch comments: ${res.status}`);
      const data = await res.json();
      setComments((prev) => ({ ...prev, [videoId]: data }));
    } catch (err) {
      console.error("Error fetching comments:", err);
      setComments((prev) => ({ ...prev, [videoId]: [] }));
    }
  };

  const handleLike = async (videoId: string) => {
    try {
      const res = await fetch(`/api/videos/${videoId}/like`, { method: "PATCH" });
      if (!res.ok) throw new Error(`Failed to like video: ${res.status}`);
      const { likes } = await res.json();
      setVideos((prev) =>
        prev.map((video) =>
          video.id === videoId ? { ...video, likes: likes || (video.likes || 0) + 1 } : video
        )
      );
    } catch (err) {
      console.error("Error liking video:", err);
    }
  };

  const handleAddComment = async (videoId: string) => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment }),
      });
      if (!res.ok) throw new Error(`Failed to add comment: ${res.status}`);
      const addedComment = await res.json();
      setComments((prev) => ({
        ...prev,
        [videoId]: [addedComment, ...(prev[videoId] || [])],
      }));
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const toggleComments = (videoId: string) => {
    if (showComments === videoId) {
      setShowComments(null);
    } else {
      setShowComments(videoId);
      if (!comments[videoId]) {
        fetchComments(videoId);
      }
    }
  };

  // Swipe-to-close handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    touchCurrentY.current = currentY - touchStartY.current;
    e.currentTarget.style.transform = `translateY(${touchCurrentY.current}px)`;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartY.current === null) return;
    if (touchCurrentY.current > 100) { // Swipe down threshold
      setShowComments(null);
    }
    e.currentTarget.style.transform = "translateY(0)";
    touchStartY.current = null;
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
        overflowX: "hidden", // Prevent horizontal scrolling
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

      {/* Home Button */}
      <div
        style={{
          position: "fixed",
          bottom: "80px",
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
      {videos.length > 0 ? (
        videos.map((video, index) => (
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
              ref={(el) => setVideoRef(el, index)}
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

            {/* Video Metadata - Aligned with refresh button's center */}
            <div
              style={{
                position: "absolute",
                top: "42px",
                left: "20px",
                background: "rgba(0, 0, 0, 0.7)",
                padding: "8px 12px",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
                backdropFilter: "blur(4px)",
                maxWidth: "80%",
                lineHeight: "1.5",
                transform: "translateY(-50%)",
              }}
            >
              Uploaded {moment(video.uploadDate).fromNow()} by {video.userId}
            </div>

            {/* Like and Comment Buttons */}
            <div
              style={{
                position: "absolute",
                right: "20px",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                zIndex: 100,
              }}
            >
              <button
                onClick={() => handleLike(video.id)}
                style={{
                  background: "rgba(0, 0, 0, 0.7)",
                  borderRadius: "50%",
                  padding: "10px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Like"
              >
                <FaHeart size={24} color="#ff4d4f" />
                <span style={{ color: "#fff", marginLeft: "5px" }}>{video.likes || 0}</span>
              </button>

              <button
                onClick={() => toggleComments(video.id)}
                style={{
                  background: "rgba(0, 0, 0, 0.7)",
                  borderRadius: "50%",
                  padding: "10px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Comment"
              >
                <FaComment size={24} color="#fff" />
              </button>
            </div>

            {/* Comments Overlay - No close button, swipe-to-close only */}
            {showComments === video.id && (
              <div
                style={{
                  position: "fixed", // Changed to fixed to prevent scrolling issues
                  bottom: "0",
                  left: "0",
                  right: "0",
                  background: "rgba(0, 0, 0, 0.8)",
                  padding: "20px",
                  zIndex: 200,
                  maxHeight: "50vh",
                  overflowY: "auto",
                  overflowX: "hidden", // Prevent horizontal overflow
                  backdropFilter: "blur(4px)",
                  borderTopLeftRadius: "12px",
                  borderTopRightRadius: "12px",
                  transition: "transform 0.2s ease-out",
                  width: "100%", // Ensure it takes full width
                  boxSizing: "border-box", // Include padding in width calculation
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Add Comment Section */}
                <div
                  style={{
                    marginTop: "20px",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    width: "100%", // Ensure it doesn't exceed container width
                    boxSizing: "border-box",
                  }}
                >
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "8px",
                      border: "none",
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      fontSize: "14px",
                      width: "100%", // Ensure input doesn't overflow
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    onClick={() => handleAddComment(video.id)}
                    style={{
                      padding: "12px 20px",
                      backgroundColor: "#0288d1",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      flexShrink: 0, // Prevent button from shrinking
                    }}
                  >
                    Post
                  </button>
                </div>

                {/* Comments List */}
                <div style={{ marginTop: "20px", width: "100%", boxSizing: "border-box" }}>
                  {(comments[video.id] || []).map((comment) => (
                    <div
                      key={comment._id}
                      style={{
                        padding: "12px 0",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        width: "100%", // Ensure comments don't overflow
                        boxSizing: "border-box",
                      }}
                    >
                      <p style={{ color: "#fff", margin: "0", fontSize: "14px", wordBreak: "break-word" }}>
                        {comment.text}
                      </p>
                      <p style={{ color: "#aaa", fontSize: "12px", margin: "0", wordBreak: "break-word" }}>
                        {moment(comment.createdAt).fromNow()} by {comment.userId}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        !loading && !error && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#fff",
              background: "rgba(0,0,0,0.8)",
              padding: "16px",
              borderRadius: "8px",
              zIndex: 100,
            }}
          >
            <p>No videos available yet.</p>
          </div>
        )
      )}

      {/* Loading/Error States */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 100,
          color: "#fff",
          background: "rgba(0,0,0,0.8)",
          padding: "16px",
          borderRadius: "8px",
          display: loading || error ? "block" : "none",
        }}
      >
        {loading && <p>Loading videos...</p>}
        {error && <p>{error}</p>}
      </div>
    </div>
  );
};

export default FeedPage;