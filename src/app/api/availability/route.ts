import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

    // Standard available time slots
    const defaultSlots = [
      '10:00 AM – 12:00 PM',
      '12:00 PM – 02:00 PM',
      '02:00 PM – 04:00 PM',
      '04:00 PM – 06:00 PM',
      '06:00 PM – 08:00 PM',
    ];

    if (!dateParam) {
      return NextResponse.json({
        available: true,
        slots: defaultSlots,
      });
    }

    const selectedDate = new Date(dateParam);
    if (isNaN(selectedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date parameter' }, { status: 400 });
    }

    // 1. Check for specific Holiday
    const holiday = await prisma.holiday.findFirst({
      where: {
        date: {
          equals: selectedDate,
        },
      },
    });

    if (holiday) {
      return NextResponse.json({
        available: false,
        reason: holiday.reason || 'Workshop is closed for a holiday on this date.',
        slots: [],
      });
    }

    // 2. Check Weekday availability rule (0 = Sunday, 1 = Monday, ... 6 = Saturday)
    const weekday = selectedDate.getDay();
    const rule = await prisma.availabilityRule.findUnique({
      where: { weekday },
    });

    if (rule && rule.isClosed) {
      return NextResponse.json({
        available: false,
        reason: 'Workshop is routinely closed on this day of the week.',
        slots: [],
      });
    }

    // 3. Count existing bookings for this date to check capacity
    const bookingsCount = await prisma.booking.count({
      where: {
        preferredDate: selectedDate,
        status: { notIn: ['cancelled', 'rejected'] },
      },
    });

    const maxCapacity = rule?.slotCapacity ? rule.slotCapacity * defaultSlots.length : 25;
    if (bookingsCount >= maxCapacity) {
      return NextResponse.json({
        available: false,
        reason: 'All service slots are fully booked for this date. Please select another date.',
        slots: [],
      });
    }

    return NextResponse.json({
      available: true,
      openTime: rule?.openTime || '09:00',
      closeTime: rule?.closeTime || '20:00',
      slots: defaultSlots,
      bookingsCount,
    });
  } catch (error) {
    console.error('Availability check error:', error);
    return NextResponse.json({
      available: true,
      slots: [
        '10:00 AM – 12:00 PM',
        '12:00 PM – 02:00 PM',
        '02:00 PM – 04:00 PM',
        '04:00 PM – 06:00 PM',
        '06:00 PM – 08:00 PM',
      ],
    });
  }
}
