import connectToDatabase from "@/lib/mongodb";
import Video from "@/lib/video.model";

jest.mock("next/server", () => ({ NextResponse: { json: (body: unknown, init?: ResponseInit) => ({ status: init?.status ?? 200, json: async () => body }) } }));
jest.mock("@/lib/mongodb", () => jest.fn());
jest.mock("@/lib/video.model", () => ({ findOneAndUpdate: jest.fn() }));
jest.mock("@mux/mux-node", () => ({
  Mux: jest.fn().mockImplementation(() => ({
    video: { uploads: { retrieve: jest.fn() }, assets: { retrieve: jest.fn() } },
  })),
}));

import { POST } from "./route";
import { Mux } from "@mux/mux-node";

const mockMux = (Mux as jest.Mock).mock.results;
const uploads = () => mockMux[0].value.video.uploads.retrieve as jest.Mock;
const assets = () => mockMux[0].value.video.assets.retrieve as jest.Mock;
const request = () => ({ json: async () => ({ uploadId: "upload-1" }) }) as never;

beforeEach(() => {
  jest.clearAllMocks();
  (connectToDatabase as jest.Mock).mockResolvedValue(undefined);
  (Video.findOneAndUpdate as jest.Mock).mockResolvedValue({});
});

describe("POST /api/upload-completed", () => {
  it("retries until Mux creates an asset, then marks the video ready", async () => {
    uploads().mockResolvedValueOnce({}).mockResolvedValueOnce({ asset_id: "asset-1" });
    assets().mockResolvedValue({ playback_ids: [{ id: "playback-1" }] });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(uploads()).toHaveBeenCalledTimes(2);
    expect(Video.findOneAndUpdate).toHaveBeenCalledWith({ muxUploadId: "upload-1" }, { muxAssetId: "asset-1", playbackId: "playback-1", status: "ready" }, { new: true });
  });

  it("keeps a late Mux upload in processing", async () => {
    uploads().mockResolvedValue({});
    const response = await POST(request());
    expect(response.status).toBe(202);
    expect(await response.json()).toMatchObject({ success: true, status: "processing" });
    expect(uploads()).toHaveBeenCalledTimes(4);
    expect(Video.findOneAndUpdate).toHaveBeenCalledWith({ muxUploadId: "upload-1" }, { status: "processing" }, { new: true });
  });

  it("keeps an asset without playback IDs in processing", async () => {
    uploads().mockResolvedValue({ asset_id: "asset-1" });
    assets().mockResolvedValue({ playback_ids: [] });
    const response = await POST(request());
    expect(response.status).toBe(202);
    expect(await response.json()).toMatchObject({ status: "processing" });
    expect(Video.findOneAndUpdate).toHaveBeenCalledWith({ muxUploadId: "upload-1" }, { status: "processing", muxAssetId: "asset-1" }, { new: true });
  });
});
