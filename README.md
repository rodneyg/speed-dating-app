# Speed Dating Web App

## Overview

I built this TikTok-style video speed dating app where people can record quick intros, then browse other users' videos. It's mobile-first and works in a native WebView, so it can be easily updated and used across platforms.

## Video Demo

https://github.com/user-attachments/assets/cf4bc84c-c86e-4f5e-b618-04fcc4a36103

## Installation and Getting Started

### Prerequisites

You'll need:

* **Node.js:** v18+
* **npm**
* **MongoDB:** Local or cloud-based (like MongoDB Atlas)
* **Mux Account:** For video hosting (sign up at [https://www.mux.com/](https://www.mux.com/))

### Installation Steps

1. **Clone the repo:**
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd <REPOSITORY_FOLDER>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file with:
   ```
   MUX_TOKEN_ID=YOUR_MUX_TOKEN_ID
   MUX_TOKEN_SECRET=YOUR_MUX_TOKEN_SECRET
   MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
   ```

4. **Run the dev server:**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` to see the app.

### Using the App

1. **Home Page:** You'll see options to "Record Video" or "View Video Feed"

2. **Record Video:** Answer three questions:
   * What's your favorite Disney character?
   * If you could master one skill instantly, what would it be and why?
   * What's your favorite way to spend a free afternoon?
   
   Record up to 45 seconds using your camera.

3. **Review Video:** Watch your video back. You can re-record or upload it.

4. **Video Feed:** Browse videos TikTok-style. You can like videos and add comments.

## Tech Stack & Approach

### Technology Stack

* **Frontend:**
  * Next.js with App Router
  * React + TypeScript
  * Styled-Components with mobile-first design
  * react-media-recorder for video capture
  * hls.js for Mux video playback
  * moment for time formatting
  * react-icons for UI elements

* **Backend:**
  * Next.js API Routes
  * Mux for video hosting/streaming
  * MongoDB + Mongoose for data storage
  * vercel-pwa for offline capabilities
  * MagicTextSDK for iOS demo app

### Cool Features

* **TikTok-Style Feed:** Vertical scrolling with snap points, just like TikTok
* **Simple Recording:** User-friendly 45-second video capture with preview
* **Mux Integration:** Fast, reliable video hosting with direct uploads
* **MongoDB Backend:** Stores all video metadata, likes, and comments
* **Basic Social Features:** Like videos and leave comments
* **Offline Support:** Caches assets and some data via service workers
* **iOS Demo:** Works in a native iOS container using MagicTextSDK
* **Basic Unit Tests:** For the FeedPage component using Jest

## Limitations & Future Work

### Current Limitations

* **Scalability:** Next.js API routes might not handle massive user loads
* **No Real Auth:** Just using anonymous IDs right now
* **Basic Video Features:** No filters or effects beyond simple preview
* **Not Real-Time:** Have to refresh to see new likes/comments
* **Limited Testing:** Just basic tests on the FeedPage component
* **Offline Video:** Can't play videos offline (Mux hosted)

### What I'd Add Next

* **Real User Accounts:** Full auth and profiles
* **Real-Time Interactions:** WebSockets for instant likes/comments
* **Better Test Coverage:** More comprehensive testing
* **Infinite Scroll:** Load videos as you browse
* **Recommendation Engine:** Personalized video feed
* **Native Bridge Features:** Push notifications from iOS
* **Video Editing:** Filters, text overlays, basic editing
* **Server-Side Processing:** For better performance on effects
