import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET() {
  const target = process.env.DEMO_VIDEO_URL || process.env.NEXT_PUBLIC_DEMO_VIDEO_URL;
  const headers = { 'Cache-Control': 'no-store' };
  if (!target) return Response.json({ message: 'A demo video has not been configured. Open /app to use the simulator.' }, { status: 503, headers });
  try { const url = new URL(target); if (url.protocol !== 'https:') throw new Error(); return NextResponse.redirect(url, { status: 307, headers }); }
  catch { return Response.json({ message: 'The demo video link is unavailable.' }, { status: 503, headers }); }
}
