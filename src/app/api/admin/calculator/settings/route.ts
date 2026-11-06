import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can update calculator settings' }, { status: 403 });
    }

    const body = await req.json();
    const { devices, brands, brandMultipliers } = body;

    const updates = [];

    if (devices !== undefined) {
      updates.push(
        prisma.setting.upsert({
          where: { key: 'calculator_devices' },
          update: { value: JSON.stringify(devices) },
          create: { key: 'calculator_devices', value: JSON.stringify(devices) },
        })
      );
    }

    if (brands !== undefined) {
      updates.push(
        prisma.setting.upsert({
          where: { key: 'calculator_brands' },
          update: { value: JSON.stringify(brands) },
          create: { key: 'calculator_brands', value: JSON.stringify(brands) },
        })
      );
    }

    if (brandMultipliers !== undefined) {
      updates.push(
        prisma.setting.upsert({
          where: { key: 'calculator_brand_multipliers' },
          update: { value: JSON.stringify(brandMultipliers) },
          create: { key: 'calculator_brand_multipliers', value: JSON.stringify(brandMultipliers) },
        })
      );
    }

    await Promise.all(updates);

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'UPDATE_CALCULATOR_SETTINGS',
        entity: 'Setting',
        entityId: 'calculator_rules',
        details: 'Updated calculator device & brand multiplier rules',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update calculator settings error:', error);
    return NextResponse.json({ error: 'Failed to update calculator settings' }, { status: 500 });
  }
}
