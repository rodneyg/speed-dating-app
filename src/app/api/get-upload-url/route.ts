import { NextRequest, NextResponse } from "next/server";
import { Mux } from "@mux/mux-node";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!
});
const { video } = mux;

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  const upload = await video.uploads.create({
    cors_origin: "*",
    new_asset_settings: { playback_policy: ["public"] },
  });

  return NextResponse.json({ url: upload.url });
}