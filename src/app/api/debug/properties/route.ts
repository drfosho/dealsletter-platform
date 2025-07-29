import { NextResponse } from 'next/server';
import { loadProperties } from '@/lib/storage';

export async function GET() {
  const properties = await loadProperties();
  return NextResponse.json({
    totalProperties: properties.length,
    properties: properties.map(p => ({
      id: p.id,
      title: p.title,
      isDraft: p.isDraft,
      createdAt: p.createdAt
    })),
    fullData: properties
  });
}