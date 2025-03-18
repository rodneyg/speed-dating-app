"use client";

import { useEffect, useState, useRef } from "react";
import Hls from "hls.js";

const FeedPage = () => {
    const [videos, setVideos] = useState<string[]>([]);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    useEffect(() => {
        fetch("/api/get-feed")
            .then((res) => {
                console.log("Response Status:", res.status);
                console.log("Response OK:", res.ok);
                return res.text();
            })
            .then((text) => {
                console.log("Raw Response:", text);
                const data = JSON.parse(text);
                setVideos(data.map((v: any) => v.playbackUrl));
            })
            .catch((err) => console.error("Fetch Error:", err));
    }, []);

    useEffect(() => {
        videos.forEach((url, index) => {
            const video = videoRefs.current[index];
            if (video && Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    console.log(`HLS ready for video ${index}`);
                });
            } else if (video && video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            }
        });
    }, [videos]);

    return (
        <div style={{
            height: '100vh',
            overflowY: 'scroll',
            scrollSnapType: 'y mandatory',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#f0f2f5' // Light gray background - modern and subtle
        }}>
            <h1 style={{
                textAlign: 'center',
                fontSize: '2.5em',
                marginBottom: '20px',
                color: '#222' // Slightly darker title color for better contrast
            }}>Video Feed</h1>
            {videos.length === 0 ? (
                <p style={{ color: '#555' }}>No videos yet</p>  // Slightly darker "No videos yet" text
            ) : (
                videos.map((url, index) => (
                    <div key={index} style={{
                        marginBottom: '20px',
                        width: '100%',
                        maxWidth: 'none'
                    }}>
                        <video
                            ref={(el) => (videoRefs.current[index] = el)}
                            controls
                            width="100%"
                            style={{
                                height: '100vh',
                                scrollSnapAlign: 'start',
                                display: 'block',
                                borderRadius: '8px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                            }}
                        />
                    </div>
                ))
            )}
        </div>
    );
};

export default FeedPage;