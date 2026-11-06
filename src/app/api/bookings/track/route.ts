import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();

    if (!query) {
      return NextResponse.json({ error: 'Please enter a booking code or mobile number.' }, { status: 400 });
    }

    // Try finding by booking code first
    let booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { bookingCode: query.toUpperCase() },
          { customer: { mobile: query } },
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
        { error: 'No repair booking found matching the provided code or mobile number.' },
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
        quotedAmount: booking.quotedAmount,
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
