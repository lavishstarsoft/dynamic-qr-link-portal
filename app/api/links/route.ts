import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Initialize Redis if env vars exist (for Vercel deployment)
let redis: Redis | null = null;
if (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) {
  redis = new Redis({
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '',
  });
}

const dataFilePath = path.join(process.cwd(), 'data', 'links.json');

export async function GET() {
  try {
    if (redis) {
      const links = await redis.get('ott_links');
      return NextResponse.json(links || []);
    } else {
      if (!fs.existsSync(dataFilePath)) {
        return NextResponse.json([]);
      }
      const fileContent = fs.readFileSync(dataFilePath, 'utf8');
      return NextResponse.json(JSON.parse(fileContent));
    }
  } catch (error) {
    console.error('Error reading links:', error);
    return NextResponse.json({ error: 'Failed to read links' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const links = await request.json();
    
    if (redis) {
      await redis.set('ott_links', links);
    } else {
      const dataDir = path.dirname(dataFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(dataFilePath, JSON.stringify(links, null, 2), 'utf8');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing links:', error);
    return NextResponse.json({ error: 'Failed to write links' }, { status: 500 });
  }
}
