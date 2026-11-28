import connectToDatabase from "@/lib/mongodb";
import Video from "@/lib/video.model";
import { GET } from "./route";

jest.mock("next/server", () => ({
  NextResponse: { json: (body: unknown, init?: ResponseInit) => ({ status: init?.status ?? 200, json: async () => body }) },
}));
jest.mock("@/lib/mongodb", () => jest.fn());
jest.mock("@/lib/video.model", () => ({ find: jest.fn() }));

describe("GET /api/get-feed", () => {
  it("reports temporary service unavailability when the database connection fails", async () => {
    (connectToDatabase as jest.Mock).mockRejectedValueOnce(new Error("database unavailable"));

    const response = await GET();

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "Video service is temporarily unavailable. Please try again later." });
    expect(Video.find).not.toHaveBeenCalled();
  });
});
