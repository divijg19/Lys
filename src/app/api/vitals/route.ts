import { NextResponse } from "next/server";

// Ephemeral in-memory log (non-persistent). For real usage, forward to analytics.
interface VitalsEntry {
  [key: string]: unknown;
  ts: number;
}
const buffer: VitalsEntry[] = [];

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as Record<string, unknown>;
    buffer.push({ ...payload, ts: Date.now() });
    if (buffer.length > 1000) buffer.shift();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json(buffer.slice(-100));
}
