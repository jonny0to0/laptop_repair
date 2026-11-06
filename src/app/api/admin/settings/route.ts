import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settingsList = await prisma.setting.findMany();
    const settings = Object.fromEntries(settingsList.map((s) => [s.key, s.value]));

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'Only business owners can update settings' }, { status: 403 });
    }

    const body = await req.json();

    // Iterate through key-value pairs and upsert
    const updates = Object.entries(body).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );

    await Promise.all(updates);

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'UPDATE_BUSINESS_SETTINGS',
        entity: 'Setting',
        entityId: 'ALL',
        details: `Updated business settings: ${Object.keys(body).join(', ')}`,
      },
    });

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Save settings error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
