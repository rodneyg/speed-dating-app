"use client";

import { useRouter } from "next/navigation";
import { MouseEvent, useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";

export default function Home() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true); // State to control splash screen visibility

  useEffect(() => {
    // Generate a random duration between 2 and 4 seconds (2000 to 4000 ms)
    const randomDuration = Math.random() * 2000 + 2000;
    const timer = setTimeout(() => {
      setShowSplash(false); // Hide splash screen after random duration
    }, randomDuration);

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  if (showSplash) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #ff6f61 0%, #ffccbc 50%, #e0f7fa 100%)",
          animation: "gradientShift 3s ease-in-out infinite", // Animated background gradient
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            animation: "fadeOut 0.5s ease-in-out forwards", // Fade out animation
            animationDelay: "1.5s", // Start fading after 1.5s
          }}
        >
          <FaHeart
            style={{
              fontSize: "60px",
              color: "#ff4d4f",
              animation: "pulse 1.5s ease-in-out infinite", // Pulsing heart animation
            }}
          />
          <p
            style={{
              fontSize: "24px", // Increased from 18px to 24px for more impact
              color: "#ffffff",
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              animation: "fadeIn 1s ease-in-out 0.5s", // Fade in tagline
            }}
          >
            Find Your Match
          </p>
        </div>
        <style jsx global>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          @keyframes fadeOut {
            0% { opacity: 1; }
            100% { opacity: 0; display: none; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #e0f7fa 0%, #b3e5fc 100%)",
        margin: "0 auto",
        animation: "fadeIn 0.5s ease-in-out", // Fade in animation for main content
      }}
    >
      <h1
        style={{
          fontSize: "36px",
          fontWeight: "700",
          marginBottom: "16px",
          color: "#1a237e",
          lineHeight: "1.2",
        }}
      >
        Video Speed Dating
      </h1>
      <p
        style={{
          fontSize: "18px",
          marginBottom: "32px",
          color: "#455a64",
          lineHeight: "1.5",
        }}
      >
        Connect with people through short videos
      </p>
      <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
        <button
          onClick={() => router.push("/record")}
          style={{
            padding: "14px 28px",
            backgroundColor: "#0288d1",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "18px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.3s, transform 0.2s",
            boxShadow: "0 4px 12px rgba(2, 136, 209, 0.3)",
            touchAction: "manipulation",
          }}
          onMouseOver={buttonHover}
          onMouseOut={buttonNormal}
        >
          Record
        </button>
        <button
          onClick={() => router.push("/feed")}
          style={{
            padding: "14px 28px",
            backgroundColor: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "18px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.3s, transform 0.2s",
            boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
            touchAction: "manipulation",
          }}
          onMouseOver={buttonHover}
          onMouseOut={buttonNormal}
        >
          View Feed
        </button>
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Reusable button hover and normal style functions (for DRY code)
const buttonHover = (e: MouseEvent<HTMLButtonElement>) => {
  const btn = e.target as HTMLButtonElement;
  btn.style.backgroundColor = shadeColor(btn.style.backgroundColor, -20); // Darken on hover
  btn.style.transform = "scale(1.05)";
};

const buttonNormal = (e: MouseEvent<HTMLButtonElement>) => {
  const btn = e.target as HTMLButtonElement;
  btn.style.backgroundColor = originalButtonColor(btn); // Revert to original color
  btn.style.transform = "scale(1)";
};

// Utility function to shade color (for hover effect)
function shadeColor(color: string, percent: number) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);
  R = parseInt(String((R * (100 + percent)) / 100));
  G = parseInt(String((G * (100 + percent)) / 100));
  B = parseInt(String((B * (100 + percent)) / 100));
  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;
  R = Math.round(Number(R));
  G = Math.round(Number(G));
  B = Math.round(Number(B));
  const RR = R.toString(16).length == 1 ? "0" + R.toString(16) : R.toString(16);
  const GG = G.toString(16).length == 1 ? "0" + G.toString(16) : G.toString(16);
  const BB = B.toString(16).length == 1 ? "0" + B.toString(16) : B.toString(16);
  return "#" + RR + GG + BB;
}

// Utility function to extract original button color (for hover effect)
const originalButtonColor = (btn: HTMLButtonElement) => {
  return btn.style.backgroundColor;
};