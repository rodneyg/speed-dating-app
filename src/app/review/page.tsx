"use client";

import { useRouter } from "next/navigation";

const ReviewPage = () => {
  const router = useRouter();
  const { videoUrl } = router.query || {};

  if (!videoUrl) return <p>No video found</p>;

  return (
    <div>
      <h1>Review Your Video</h1>
      <video src={videoUrl as string} controls width="100%" />
      <button onClick={() => router.push("/record")}>Re-record</button>
      <button onClick={() => console.log("Upload video")}>Upload</button>
    </div>
  );
};

export default ReviewPage;