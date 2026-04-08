import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json();

    if (!process.env.ADMIN_PORTAL_SECRET) {
      return NextResponse.json({ valid: false }, { status: 500 });
    }

    const isValid = secret === process.env.ADMIN_PORTAL_SECRET;
    return NextResponse.json({ valid: isValid });
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
}