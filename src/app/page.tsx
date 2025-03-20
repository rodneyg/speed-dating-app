"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center", // Center items horizontally
        background: "linear-gradient(135deg, #e0f7fa 0%, #b3e5fc 100%)",
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: "36px",
          fontWeight: "700",
          marginBottom: "16px",
          color: "#1a237e",
          lineHeight: "1.2",
        }}
      >
        Video Speed Dating
      </h1>
      <p
        style={{
          fontSize: "18px",
          marginBottom: "32px",
          color: "#455a64",
          lineHeight: "1.5",
        }}
      >
        Connect with people through short video introductions!
      </p>
      <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
        {/* Container for buttons, center-aligned */}
        <button
          onClick={() => router.push("/record")}
          style={{
            padding: "14px 28px",
            backgroundColor: "#0288d1",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "18px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.3s, transform 0.2s",
            boxShadow: "0 4px 12px rgba(2, 136, 209, 0.3)",
            touchAction: "manipulation",
          }}
          onMouseOver={buttonHover}
          onMouseOut={buttonNormal}
        >
          Record Video
        </button>
        <button
          onClick={() => router.push("/feed")}
          style={{
            padding: "14px 28px",
            backgroundColor: "#4caf50", // Different color for View Feed button
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "18px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.3s, transform 0.2s",
            boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
            touchAction: "manipulation",
          }}
          onMouseOver={buttonHover}
          onMouseOut={buttonNormal}
        >
          View Video Feed
        </button>
      </div>
    </div>
  );
}

// Reusable button hover and normal style functions (for DRY code)
const buttonHover = (e: any) => {
  const btn = e.target as HTMLButtonElement;
  btn.style.backgroundColor = shadeColor(btn.style.backgroundColor, -20); // Darken on hover
  btn.style.transform = "scale(1.05)";
};

const buttonNormal = (e: any) => {
  const btn = e.target as HTMLButtonElement;
  btn.style.backgroundColor = originalButtonColor(btn); // Revert to original color
  btn.style.transform = "scale(1)";
};


// Utility function to shade color (for hover effect)
function shadeColor(color: string, percent: number) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);
  R = parseInt(String((R * (100 + percent)) / 100));
  G = parseInt(String((G * (100 + percent)) / 100));
  B = parseInt(String((B * (100 + percent)) / 100));
  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;
  R = Math.round(Number(R));
  G = Math.round(Number(G));
  B = Math.round(Number(B));
  const RR = R.toString(16).length == 1 ? "0" + R.toString(16) : R.toString(16);
  const GG = G.toString(16).length == 1 ? "0" + G.toString(16) : G.toString(16);
  const BB = B.toString(16).length == 1 ? "0" + B.toString(16) : B.toString(16);
  return "#" + RR + GG + BB;
}

// Utility function to extract original button color (for hover effect)
const originalButtonColor = (btn: HTMLButtonElement) => {
    return btn.style.backgroundColor;
};