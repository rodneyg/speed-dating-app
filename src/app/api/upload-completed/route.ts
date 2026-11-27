import { NextResponse } from "next/server";
import { Mux } from "@mux/mux-node";
import connectToDatabase from "@/lib/mongodb";
import Video from "@/lib/video.model";

const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!
});
const muxVideo = mux.video;

const MAX_ATTEMPTS = 4;
const RETRY_DELAY_MS = 750;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: { json: () => Promise<{ uploadId: string }> }) {
    try {
        await connectToDatabase();

        const { uploadId } = await req.json();
        console.log("Processing completed upload:", uploadId);

        // Mux may finish receiving the direct upload before it has created its asset.
        // Retry briefly so this common race does not strand the upload.
        let upload;
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
            upload = await muxVideo.uploads.retrieve(uploadId);
            if (upload?.asset_id) break;
            if (attempt < MAX_ATTEMPTS - 1) await delay(RETRY_DELAY_MS);
        }

        if (!upload?.asset_id) {
            await Video.findOneAndUpdate(
                { muxUploadId: uploadId },
                { status: "processing" },
                { new: true }
            );
            return NextResponse.json(
                { success: true, status: "processing", message: "Your video is still processing. Check back shortly." },
                { status: 202 }
            );
        }

        // Get the asset details
        const asset = await muxVideo.assets.retrieve(upload.asset_id);
        
        if (!asset || !asset.playback_ids || asset.playback_ids.length === 0) {
            console.error("Asset not found or playback IDs not available");
            await Video.findOneAndUpdate(
                { muxUploadId: uploadId },
                { status: "processing", muxAssetId: upload.asset_id },
                { new: true }
            );
            return NextResponse.json(
                { success: true, status: "processing", message: "Your video is still processing. Check back shortly." },
                { status: 202 }
            );
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
