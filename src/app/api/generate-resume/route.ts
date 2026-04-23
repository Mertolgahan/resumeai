import { NextRequest, NextResponse } from "next/server";
import { generateResumeContent, ResumeInput } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const body: ResumeInput = await request.json();

    if (!body.fullName || !body.email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    if (!body.skills || body.skills.length === 0) {
      return NextResponse.json(
        { error: "At least one skill is required." },
        { status: 400 }
      );
    }

    const resume = await generateResumeContent(body);

    return NextResponse.json({ resume });
  } catch (error) {
    console.error("Resume generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate resume. Please try again." },
      { status: 500 }
    );
  }
}