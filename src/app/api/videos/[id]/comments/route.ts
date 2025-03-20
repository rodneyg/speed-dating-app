import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Comment from "@/lib/comment.model";

// Using 'any' type with proper ESLint disable comments
export async function GET(
  request: NextRequest,
  // @ts-expect-error - Next.js 15 typing issue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment
  context: any
) {
  try {
    await connectToDatabase();

    const videoId = context.params.id;
    const comments = await Comment.find({ videoId })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error in /api/videos/[id]/comments GET:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  // @ts-expect-error - Next.js 15 typing issue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment
  context: any
) {
  try {
    await connectToDatabase();

    const videoId = context.params.id;
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }

    const newComment = new Comment({
      text,
      videoId,
      userId: "anonymous",
    });

    await newComment.save();

    return NextResponse.json(newComment);
  } catch (error) {
    console.error("Error in /api/videos/[id]/comments POST:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}