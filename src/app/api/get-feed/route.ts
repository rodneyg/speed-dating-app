import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Video from "@/lib/video.model";

export async function GET() {
  try {
    await connectToDatabase();

    console.log("GET /api/get-feed called - fetching videos from MongoDB");

    // Only fetch videos that are ready to play
    const videosFromDb = await Video.find({ status: "ready", playbackId: { $exists: true, $ne: null } })
      .sort({ uploadDate: -1 })
      .limit(10)
      .exec();

    console.log("Videos fetched from MongoDB:", videosFromDb.length);

    const videos = videosFromDb.map((videoDoc) => {
      const playbackUrl = `https://stream.mux.com/${videoDoc.playbackId}.m3u8`;
      console.log("Constructed playbackUrl:", playbackUrl);
      return {
        id: videoDoc._id.toString(),
        playbackUrl: playbackUrl,
        muxAssetId: videoDoc.muxAssetId,
        uploadDate: videoDoc.uploadDate,
        userId: videoDoc.userId,
        likes: videoDoc.likes || 0, // Include the likes field
      };
    });

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error in /api/get-feed:", error);
    return NextResponse.json({ error: "Video service is temporarily unavailable. Please try again later." }, { status: 503 });
  }
}
