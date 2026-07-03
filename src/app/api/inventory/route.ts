import { NextResponse } from 'next/server';
import { getInventory } from '@/lib/inventory';

export async function GET() {
  const inventory = await getInventory();
  return NextResponse.json(inventory);
}
