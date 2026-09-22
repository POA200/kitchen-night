import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data", "kitchens");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Ignore error if directory already exists
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await context.params;
    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Missing wallet address" },
        { status: 400 }
      );
    }

    await ensureDataDir();
    const filePath = path.join(DATA_DIR, `${wallet}.json`);

    try {
      const data = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(data);
      return NextResponse.json({ success: true, ...parsed });
    } catch {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error in GET /api/kitchen/[wallet]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await context.params;
    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Missing wallet address" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { profile, receipts } = body;

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Missing profile payload" },
        { status: 400 }
      );
    }

    await ensureDataDir();
    const filePath = path.join(DATA_DIR, `${wallet}.json`);

    await fs.writeFile(
      filePath,
      JSON.stringify({ profile, receipts: receipts || [], updatedAt: Date.now() }, null, 2),
      "utf-8"
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/kitchen/[wallet]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

