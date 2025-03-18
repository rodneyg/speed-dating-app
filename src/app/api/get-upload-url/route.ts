import { NextRequest, NextResponse } from "next/server";
import { Mux } from "@mux/mux-node";
import connectToDatabase from "@/lib/mongodb";
import Video from "@/lib/video.model";

const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!
});
const { video } = mux;

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const { userId } = await req.json();

        console.log("Before video.uploads.create() call...");

        const upload = await video.uploads.create({ 
            cors_origin: "*",
            new_asset_settings: { playback_policy: ["public"] },
        });

        const uploadUrl = upload.url;
        console.log("Mux Upload URL generated:", uploadUrl);


        console.log("Before muxVideo.assets.create() call...");

        const assetResponse = await mux.video.assets.create({ 
            input: [{ url: uploadUrl }], 
            playback_policy: ["public"],
        });


        console.log("Full assetResponse object:", assetResponse);
        console.log("Mux Asset Create Response - asset:", assetResponse);

        const muxAssetId = assetResponse.id; 
        const playbackId = assetResponse.playback_ids?.[0]?.id;


        console.log("Extracted muxAssetId:", muxAssetId);
        console.log("Extracted playbackId:", playbackId);


        // Create new Video document in MongoDB
        const newVideo = new Video({
            muxAssetId: muxAssetId,
            playbackId: playbackId,
            userId: userId,
        });

        await newVideo.save();
        console.log("Video metadata saved to MongoDB for asset ID:", muxAssetId);

        return NextResponse.json({ url: upload.url }); 


    } catch (error) {
        console.error("Error in /api/get-upload-url:", error);
        return NextResponse.json({ error: "Failed to create upload URL or Mux asset, or save metadata" }, { status: 500 }); 
    }
}