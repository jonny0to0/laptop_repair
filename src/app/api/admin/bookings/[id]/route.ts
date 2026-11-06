import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { BookingStatus, ServiceMode } from '@/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        service: true,
        area: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        attachments: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Fetch booking error:', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      status,
      quotedAmount,
      finalAmount,
      publicNote,
      internalNote,
      serviceMode,
      statusNote,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (status && status !== existingBooking.status) {
      updateData.status = status as BookingStatus;
    }

    if (quotedAmount !== undefined) {
      updateData.quotedAmount = quotedAmount === '' || quotedAmount === null ? null : parseFloat(quotedAmount);
    }

    if (finalAmount !== undefined) {
      updateData.finalAmount = finalAmount === '' || finalAmount === null ? null : parseFloat(finalAmount);
    }

    if (publicNote !== undefined) {
      updateData.publicNote = publicNote;
    }

    if (internalNote !== undefined) {
      updateData.internalNote = internalNote;
    }

    if (serviceMode) {
      updateData.serviceMode = serviceMode as ServiceMode;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        customer: true,
        service: true,
        area: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // If status changed, record in BookingStatusHistory
    if (status && status !== existingBooking.status) {
      await prisma.bookingStatusHistory.create({
        data: {
          bookingId: bookingId,
          fromStatus: existingBooking.status,
          toStatus: status as BookingStatus,
          changedBy: `${session.name} (${session.role})`,
          note: statusNote || `Status updated from ${existingBooking.status} to ${status}`,
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: session.id,
          action: 'UPDATE_BOOKING_STATUS',
          entity: 'Booking',
          entityId: String(bookingId),
          details: `Changed status from ${existingBooking.status} to ${status}. Note: ${statusNote || 'None'}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'Only business owners can delete bookings' }, { status: 403 });
    }

    const { id } = await context.params;
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    await prisma.booking.delete({
      where: { id: bookingId },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'DELETE_BOOKING',
        entity: 'Booking',
        entityId: String(bookingId),
        details: `Deleted booking ID ${bookingId}`,
      },
    });

    return NextResponse.json({ success: true, message: 'Booking permanently deleted' });
  } catch (error) {
    console.error('Delete booking error:', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
