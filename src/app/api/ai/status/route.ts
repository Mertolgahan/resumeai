import { NextResponse } from "next/server";
import { aiProvider } from "@/lib/ai";

export async function GET() {
  const providers = await aiProvider.getAvailableProviders();
  return NextResponse.json({ providers });
}