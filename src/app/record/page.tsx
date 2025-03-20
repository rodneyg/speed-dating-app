"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FaArrowLeft } from "react-icons/fa"; // Import back arrow icon

const Recorder = dynamic(() => import("../../components/Recorder"), {
  ssr: false,
  loading: () => <p style={{ textAlign: "center", color: "#666" }}>Loading recorder...</p>,
});

const RecordPage = () => {
  const router = useRouter();

  const handleRecordingComplete = (blobUrl: string | null) => {
    console.log("Blob URL from Recorder:", blobUrl);
    if (blobUrl) {
      localStorage.setItem("recordedVideoUrl", blobUrl);
      router.push("/review");
    }
  };

  return (
    <div
      style={{
        margin: "0 auto",
        padding: "20px",
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: 'relative', // Make container relative for absolute positioning of back button
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        aria-label="Go back"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(0,0,0,0.7)',
          borderRadius: '50%',
          padding: '10px',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100, // Ensure it's above other content
        }}
      >
        <FaArrowLeft size={20} color="#fff" />
      </button>
      <h1
        style={{
          fontSize: "28px",
          fontWeight: "700",
          color: "#1a237e",
          marginBottom: "16px",
          textAlign: "center",
        }}
      >
        Record Your Video
      </h1>
      <p
        style={{
          fontSize: "16px",
          color: "#455a64",
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        Answer these questions (45 seconds max):
      </p>
      <ul
        style={{
          listStyleType: "none",
          padding: 0,
          marginBottom: "32px",
        }}
      >
        <li
          style={{
            fontSize: "16px",
            color: "#333",
            marginBottom: "12px",
            paddingLeft: "12px",
            borderLeft: "3px solid #0288d1",
          }}
        >
          What’s your favorite Disney character?
        </li>
        <li
          style={{
            fontSize: "16px",
            color: "#333",
            marginBottom: "12px",
            paddingLeft: "12px",
            borderLeft: "3px solid #0288d1",
          }}
        >
          If you could master one skill instantly, what would it be and why?
        </li>
        <li
          style={{
            fontSize: "16px",
            color: "#333",
            marginBottom: "12px",
            paddingLeft: "12px",
            borderLeft: "3px solid #0288d1",
          }}
        >
          What’s your favorite way to spend a free afternoon?
        </li>
      </ul>
      <Recorder onRecordingComplete={handleRecordingComplete} />
    </div>
  );
};

export default RecordPage;