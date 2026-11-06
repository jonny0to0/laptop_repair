import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'calculator_button_active' },
    });
    const active = setting ? setting.value !== 'false' : true;
    return NextResponse.json({ active });
  } catch (error) {
    console.error('Failed to get calculator button status:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { active } = body;
    const boolValue = Boolean(active);

    await prisma.setting.upsert({
      where: { key: 'calculator_button_active' },
      update: { value: boolValue ? 'true' : 'false' },
      create: { key: 'calculator_button_active', value: boolValue ? 'true' : 'false' },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: boolValue ? 'ACTIVATE_CALCULATOR_BUTTON' : 'DEACTIVATE_CALCULATOR_BUTTON',
        entity: 'Setting',
        entityId: 'calculator_button_active',
        details: `Home page Calculate Repair Cost button ${boolValue ? 'activated' : 'deactivated'}`,
      },
    });

    try {
      revalidatePath('/');
      revalidatePath('/admin/calculator');
      revalidatePath('/calculate-repair-cost');
    } catch (e) {
      console.warn('Revalidate path warning:', e);
    }

    return NextResponse.json({ success: true, active: boolValue });
  } catch (error) {
    console.error('Failed to update calculator button status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
