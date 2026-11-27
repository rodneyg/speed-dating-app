import { act, fireEvent, render, screen } from "@testing-library/react";
import Recorder from "../Recorder";

const mediaRecorder = {
  status: "idle",
  startRecording: jest.fn(),
  stopRecording: jest.fn(),
  mediaBlobUrl: null,
  previewStream: null,
  error: null,
};

jest.mock("react-media-recorder", () => ({
  useReactMediaRecorder: () => mediaRecorder,
}));

describe("Recorder duration limit", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mediaRecorder.status = "idle";
    mediaRecorder.startRecording.mockClear();
    mediaRecorder.stopRecording.mockClear();
  });

  afterEach(() => jest.useRealTimers());

  it("stops after 45 seconds, displays the countdown, and clears its timer on manual stop and unmount", () => {
    const { rerender, unmount } = render(<Recorder onRecordingComplete={jest.fn()} />);
    mediaRecorder.status = "recording";
    rerender(<Recorder onRecordingComplete={jest.fn()} />);

    expect(screen.getByText("Recording... 45s left")).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(3000));
    expect(screen.getByText("Recording... 42s left")).toBeInTheDocument();

    act(() => jest.advanceTimersByTime(42000));
    expect(mediaRecorder.stopRecording).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);

    mediaRecorder.status = "recording";
    rerender(<Recorder onRecordingComplete={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Stop Recording" }));
    mediaRecorder.status = "stopped";
    rerender(<Recorder onRecordingComplete={jest.fn()} />);
    expect(jest.getTimerCount()).toBe(0);

    mediaRecorder.status = "recording";
    rerender(<Recorder onRecordingComplete={jest.fn()} />);
    expect(jest.getTimerCount()).toBe(1);
    unmount();
    expect(jest.getTimerCount()).toBe(0);
  });
});
