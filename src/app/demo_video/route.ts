// src/app/demo_video/route.ts — Dynamic hackathon demo video redirect route.
// Allows submitting a permanent URL (e.g. https://your-app.workers.dev/demo_video) to hackathon portals,
// while letting you update the target YouTube/Loom video link at any time without invalidating the submitted link.
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEFAULT_VIDEO = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Fallback link

export async function GET() {
  const targetUrl = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL || process.env.DEMO_VIDEO_URL || DEFAULT_VIDEO;
  
  // 307 Temporary Redirect ensures browsers and proxies do not cache the destination permanently
  return NextResponse.redirect(targetUrl, {
    status: 307,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
