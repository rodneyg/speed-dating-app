import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb"; // Import connectToDatabase

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase(); // Try to connect to MongoDB
        console.log("MongoDB connection TEST successful in /api/get-upload-url");
        return NextResponse.json({ message: "MongoDB connection test successful" }, { status: 200 });
    } catch (error) {
        console.error("MongoDB connection TEST failed in /api/get-upload-url", error);
        return NextResponse.json({ error: "MongoDB connection test failed" }, { status: 500 });
    }
}