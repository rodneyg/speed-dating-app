import { NextRequest, NextResponse } from "next/server";
import { Mux } from "@mux/mux-node";
import connectToDatabase from "@/lib/mongodb";
import Video from "@/lib/video.model";

const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!
});
const muxVideo = mux.video;

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const { userId } = await req.json();

        console.log("Generating Mux Upload URL...");

        // Create upload with new_asset_settings - removed the mp4_support param
        const upload = await muxVideo.uploads.create({
            cors_origin: "*",
            new_asset_settings: { 
                playback_policy: ["public"]
            },
        });

        const uploadUrl = upload.url;
        const uploadId = upload.id;

        console.log("Mux Upload URL generated:", uploadUrl);
        console.log("Mux Upload ID:", uploadId);

        // Create a temporary record in the database
        const newVideo = new Video({
            muxUploadId: uploadId,
            userId: userId,
            status: "uploading"
        });

        await newVideo.save();
        console.log("Temporary video record created with uploadId:", uploadId);

        return NextResponse.json({ 
            url: uploadUrl,
            uploadId: uploadId
        });

    } catch (error) {
        console.error("Error in /api/get-upload-url:", error);
        return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 });
    }
}