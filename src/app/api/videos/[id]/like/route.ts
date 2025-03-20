import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Video from "@/lib/video.model";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    const videoId = params.id;
    const video = await Video.findById(videoId);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Increment the likes counter
    video.likes = (video.likes || 0) + 1;
    await video.save();

    return NextResponse.json({ likes: video.likes });
  } catch (error) {
    console.error("Error in /api/videos/[id]/like:", error);
    return NextResponse.json({ error: "Failed to update likes" }, { status: 500 });
  }
}