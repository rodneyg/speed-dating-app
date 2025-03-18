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

        const { uploadId } = await req.json();
        console.log("Processing completed upload:", uploadId);

        // Check if the upload exists and is completed
        const upload = await muxVideo.uploads.retrieve(uploadId);
        
        if (!upload || !upload.asset_id) {
            console.error("Upload not found or asset not created yet");
            return NextResponse.json({ error: "Upload not found or still processing" }, { status: 404 });
        }

        // Get the asset details
        const asset = await muxVideo.assets.retrieve(upload.asset_id);
        
        if (!asset || !asset.playback_ids || asset.playback_ids.length === 0) {
            console.error("Asset not found or playback IDs not available");
            return NextResponse.json({ error: "Asset not found or playback IDs not available" }, { status: 404 });
        }

        const playbackId = asset.playback_ids[0].id;
        console.log("Got playback ID:", playbackId);

        // Update the video record in the database
        await Video.findOneAndUpdate(
            { muxUploadId: uploadId },
            { 
                muxAssetId: upload.asset_id,
                playbackId: playbackId,
                status: "ready"
            },
            { new: true }
        );

        console.log("Video record updated with asset ID and playback ID");
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error in /api/upload-completed:", error);
        return NextResponse.json({ error: "Failed to process upload completion" }, { status: 500 });
    }
}