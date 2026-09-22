import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;
  let cloudDb = 'not-tested';

  try {
    const { cloudDb: db } = require('../../../../lib/db.js');
    const row = await db.get('SELECT 1 AS ok');
    cloudDb = row && Number(row.ok) === 1 ? 'CONNECTED' : 'QUERY_FAILED';
  } catch (error) {
    cloudDb = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json({
    ok: cloudDb === 'CONNECTED',
    vercel: process.env.VERCEL || null,
    nodeEnv: process.env.NODE_ENV || null,
    databaseUrlPresent: !!databaseUrl,
    databaseUrlLength: databaseUrl ? databaseUrl.length : 0,
    cloudDb
  });
}
