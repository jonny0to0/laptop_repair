import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQuery = searchParams.get('q') || searchParams.get('code') || '';
    const query = rawQuery.trim();

    if (!query) {
      return NextResponse.json({ error: 'Please enter a booking code or mobile number.' }, { status: 400 });
    }

    const digitsOnly = query.replace(/[^0-9]/g, '');
    const isPhoneSearch = digitsOnly.length >= 7;

    // Search by booking code (case-insensitive) or customer mobile
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { bookingCode: { equals: query } },
          { bookingCode: { equals: query.toUpperCase() } },
          ...(isPhoneSearch
            ? [
                { customer: { mobile: query } },
                { customer: { mobile: { contains: digitsOnly } } },
                ...(digitsOnly.length >= 10
                  ? [{ customer: { mobile: { contains: digitsOnly.slice(-10) } } }]
                  : []),
              ]
            : [{ customer: { mobile: query } }]),
        ],
      },
      include: {
        customer: { select: { name: true, mobile: true } },
        service: { select: { name: true, slug: true } },
        area: { select: { name: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'No repair booking found matching the provided reference code or phone number.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingCode: booking.bookingCode,
        customerName: booking.customer.name,
        deviceType: booking.deviceType,
        brand: booking.brand,
        model: booking.model,
        problem: booking.problem,
        serviceMode: booking.serviceMode,
        serviceName: booking.service.name,
        status: booking.status,
        quotedAmount: booking.quotedAmount ? Number(booking.quotedAmount) : null,
        finalAmount: booking.finalAmount ? Number(booking.finalAmount) : null,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        statusHistory: booking.statusHistory.map((h) => ({
          fromStatus: h.fromStatus,
          toStatus: h.toStatus,
          changedBy: h.changedBy,
          note: h.note,
          createdAt: h.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Track error:', error);
    return NextResponse.json(
      { error: 'Failed to look up booking status. Please try again later.' },
      { status: 500 }
    );
  }
}
