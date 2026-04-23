import { NextRequest, NextResponse } from "next/server";
import { generateCoverLetterContent, CoverLetterInput } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const body: CoverLetterInput = await request.json();

    if (!body.fullName || !body.jobTitle || !body.companyName || !body.experienceSummary) {
      return NextResponse.json(
        { error: "Full name, job title, company, and experience summary are required." },
        { status: 400 }
      );
    }

    const coverLetter = await generateCoverLetterContent(body);

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error("Cover letter generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter. Please try again." },
      { status: 500 }
    );
  }
}