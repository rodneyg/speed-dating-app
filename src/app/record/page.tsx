"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import the Recorder component with SSR disabled
const Recorder = dynamic(() => import("../../components/Recorder"), {
  ssr: false,
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
    <div>
      <h1>Record Your Video</h1>
      <p>Answer these questions (45 seconds max):</p>
      <ul>
        <li>What’s your favorite Disney character?</li>
        <li>If you could master one skill instantly, what would it be and why?</li>
        <li>What’s your favorite way to spend a free afternoon?</li>
      </ul>
      <Recorder onRecordingComplete={handleRecordingComplete} />
    </div>
  );
};

export default RecordPage;