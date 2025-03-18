import { NextRequest, NextResponse } from "next/server";
import { Mux } from "@mux/mux-node";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!
});
const { video } = mux;

export async function GET(_req: NextRequest) {
  console.log("GET /api/get-feed called");
  try {
    const assetsResponse = await video.assets.list({ limit: 10 });
    const assets = assetsResponse.data; // Access the 'data' array
    console.log("Assets fetched:", assets.length);
    const videos = assets.map((asset: any) => ({ // Temporary 'any' for now
      playbackUrl: `https://stream.mux.com/${asset.playback_ids![0].id}.m3u8`,
    }));
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Mux fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}