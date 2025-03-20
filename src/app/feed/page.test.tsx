import { render, screen, waitFor } from "@testing-library/react";
import FeedPage from "./page";
import { useRouter } from "next/navigation";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock HLS.js
jest.mock("hls.js", () => {
  const mockHls = jest.fn().mockImplementation(() => ({
    loadSource: jest.fn(),
    attachMedia: jest.fn(),
    on: jest.fn(),
  }));
  mockHls.isSupported = jest.fn(() => true);
  // Mock Hls.Events with MANIFEST_PARSED
  mockHls.Events = {
    MANIFEST_PARSED: "hlsManifestParsed",
  };
  return mockHls;
});

// Mock fetch API
global.fetch = jest.fn();

describe("FeedPage", () => {
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks(); // Reset mocks before each test
  });

  it("renders without crashing", async () => {
    // Mock fetch to return an empty array
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<FeedPage />);
    await waitFor(() => {
      expect(screen.getByText("No videos available yet.")).toBeInTheDocument();
    });
  });

  it("displays loading message while fetching videos", async () => {
    // Mock fetch to hang (simulating a pending request)
    (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));

    render(<FeedPage />);
    expect(screen.getByText("Loading videos...")).toBeInTheDocument();
  });

  it("shows videos when data is fetched successfully", async () => {
    // Mock fetch to return sample video data
    const mockVideos = [
      {
        id: "1",
        playbackUrl: "https://stream.mux.com/test.m3u8",
        uploadDate: "2023-10-01T12:00:00Z",
        userId: "anonymous",
        likes: 5,
      },
    ];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockVideos,
    });

    render(<FeedPage />);
    await waitFor(() => {
      expect(screen.getByText(/Uploaded .* by anonymous/)).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument(); // Check likes count
    });
  });
});