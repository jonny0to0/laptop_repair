import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [rules, holidays] = await Promise.all([
      prisma.availabilityRule.findMany({
        orderBy: { weekday: 'asc' },
      }),
      prisma.holiday.findMany({
        orderBy: { date: 'asc' },
      }),
    ]);

    return NextResponse.json({ rules, holidays });
  } catch (error) {
    console.error('Fetch availability error:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'Only business owners can update schedule' }, { status: 403 });
    }

    const body = await req.json();
    const { rules, newHoliday, deleteHolidayId } = body;

    // 1. Update weekday rules if provided
    if (rules && Array.isArray(rules)) {
      for (const r of rules) {
        await prisma.availabilityRule.upsert({
          where: { weekday: r.weekday },
          update: {
            openTime: r.openTime,
            closeTime: r.closeTime,
            slotCapacity: parseInt(r.slotCapacity, 10) || 5,
            isClosed: Boolean(r.isClosed),
          },
          create: {
            weekday: r.weekday,
            openTime: r.openTime,
            closeTime: r.closeTime,
            slotCapacity: parseInt(r.slotCapacity, 10) || 5,
            isClosed: Boolean(r.isClosed),
          },
        });
      }
    }

    // 2. Add new holiday if provided
    if (newHoliday && newHoliday.date) {
      const holidayDate = new Date(newHoliday.date);
      if (!isNaN(holidayDate.getTime())) {
        await prisma.holiday.upsert({
          where: { date: holidayDate },
          update: { reason: newHoliday.reason || null },
          create: { date: holidayDate, reason: newHoliday.reason || null },
        });
      }
    }

    // 3. Delete holiday if provided
    if (deleteHolidayId) {
      await prisma.holiday.delete({
        where: { id: parseInt(deleteHolidayId, 10) },
      });
    }

    return NextResponse.json({ success: true, message: 'Availability schedule updated' });
  } catch (error) {
    console.error('Update availability error:', error);
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 });
  }
}
