import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ reach: 0, engagement: 0, posts: 0, followers: 0 });
}
