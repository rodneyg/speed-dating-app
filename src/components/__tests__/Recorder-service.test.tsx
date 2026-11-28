import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Recorder from "../Recorder";

const startRecording = jest.fn();

jest.mock("react-media-recorder", () => ({
  useReactMediaRecorder: () => ({ status: "idle", startRecording, stopRecording: jest.fn(), mediaBlobUrl: null, previewStream: null, error: null }),
}));

describe("Recorder upload availability", () => {
  it("does not start recording when the server cannot prepare an upload", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 }) as jest.Mock;
    render(<Recorder onRecordingComplete={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Start Recording" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("video service is temporarily unavailable");
    await waitFor(() => expect(startRecording).not.toHaveBeenCalled());
  });
});
