"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e0f7fa 0%, #b3e5fc 100%)",
        margin: "0 auto",
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
        Welcome to Speed Dating
      </h1>
      <p
        style={{
          fontSize: "18px",
          marginBottom: "32px",
          color: "#455a64",
          lineHeight: "1.5",
        }}
      >
        Record a short video to connect with others!
      </p>
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
          touchAction: "manipulation", // Better touch response
        }}
        onMouseOver={(e) => {
          const btn = e.target as HTMLButtonElement;
          btn.style.backgroundColor = "#0277bd";
          btn.style.transform = "scale(1.05)";
        }}
        onMouseOut={(e) => {
          const btn = e.target as HTMLButtonElement;
          btn.style.backgroundColor = "#0288d1";
          btn.style.transform = "scale(1)";
        }}
      >
        Start Recording
      </button>
    </div>
  );
}