import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Video from "@/lib/video.model";

export async function GET(_req: NextRequest) {
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
                id: videoDoc._id,
                playbackUrl: playbackUrl,
                muxAssetId: videoDoc.muxAssetId,
                uploadDate: videoDoc.uploadDate,
                userId: videoDoc.userId,
            };
        });

        return NextResponse.json(videos);

    } catch (error) {
        console.error("Error in /api/get-feed:", error);
        return NextResponse.json({ error: "Failed to fetch videos from MongoDB" }, { status: 500 });
    }
}