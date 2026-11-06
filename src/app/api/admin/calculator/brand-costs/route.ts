import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'Only business owners can update brand pricing rules' }, { status: 403 });
    }

    const body = await req.json();
    const { brandCategoryCosts } = body;

    if (!brandCategoryCosts || typeof brandCategoryCosts !== 'object') {
      return NextResponse.json({ error: 'Invalid brand category cost payload' }, { status: 400 });
    }

    await prisma.setting.upsert({
      where: { key: 'calculator_brand_category_costs' },
      update: { value: JSON.stringify(brandCategoryCosts) },
      create: { key: 'calculator_brand_category_costs', value: JSON.stringify(brandCategoryCosts) },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'UPDATE_BRAND_CATEGORY_COSTS',
        entity: 'Setting',
        entityId: 'calculator_brand_category_costs',
        details: `Updated brand-specific repair category pricing rules`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update brand category costs error:', error);
    return NextResponse.json({ error: 'Failed to save brand category costs' }, { status: 500 });
  }
}
