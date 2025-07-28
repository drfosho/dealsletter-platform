import { NextRequest, NextResponse } from 'next/server';
import { properties } from '@/lib/properties';

export async function GET() {
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