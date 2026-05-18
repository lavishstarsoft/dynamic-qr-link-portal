import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'links.json');

export async function GET() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return NextResponse.json([]);
    }
    const fileContent = fs.readFileSync(dataFilePath, 'utf8');
    const links = JSON.parse(fileContent);
    return NextResponse.json(links);
  } catch (error) {
    console.error('Error reading links:', error);
    return NextResponse.json({ error: 'Failed to read links' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const links = await request.json();
    fs.writeFileSync(dataFilePath, JSON.stringify(links, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing links:', error);
    return NextResponse.json({ error: 'Failed to write links' }, { status: 500 });
  }
}
