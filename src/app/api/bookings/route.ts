import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const BookingCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  mobile: z.string().min(8, 'Enter a valid mobile contact number').max(20),
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
  deviceType: z.string().min(1, 'Please select a device type').max(50),
  brand: z.string().max(100).optional().or(z.literal('')),
  model: z.string().max(100).optional().or(z.literal('')),
  problem: z.string().min(3, 'Please describe or select the issue').max(2000),
  serviceSlug: z.string().optional().or(z.literal('')),
  serviceMode: z.enum(['shop_visit', 'home_pickup', 'on_site']).default('shop_visit'),
  preferredDate: z.string().optional().or(z.literal('')),
  preferredSlot: z.string().optional().or(z.literal('')),
  address: z.string().max(1000).optional().or(z.literal('')),
  areaSlug: z.string().optional().or(z.literal('')),
});

// Helper to generate a unique readable booking code like PRO-74291
function generateBookingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomStr = '';
  for (let i = 0; i < 5; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PRO-${randomStr}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = BookingCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid form input' },
        { status: 400 }
      );
    }

    const {
      name,
      mobile,
      email,
      deviceType,
      brand,
      model,
      problem,
      serviceSlug,
      serviceMode,
      preferredDate,
      preferredSlot,
      address,
      areaSlug,
    } = result.data;

    const cleanMobile = mobile.trim();
    const cleanName = name.trim();
    const cleanEmail = email && email.trim() !== '' ? email.trim() : null;

    // 1. Find or create Customer by mobile
    const customer = await prisma.customer.upsert({
      where: { mobile: cleanMobile },
      update: {
        name: cleanName,
        ...(cleanEmail ? { email: cleanEmail } : {}),
        ...(address && address.trim() !== '' ? { address: address.trim() } : {}),
      },
      create: {
        name: cleanName,
        mobile: cleanMobile,
        email: cleanEmail,
        address: address && address.trim() !== '' ? address.trim() : null,
      },
    });

    // 2. Resolve Service ID (matching serviceSlug or fallback to first available service)
    let service = null;
    if (serviceSlug) {
      service = await prisma.service.findUnique({
        where: { slug: serviceSlug },
      });
    }

    if (!service) {
      service = await prisma.service.findFirst({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    }

    if (!service) {
      return NextResponse.json(
        { error: 'No active repair services available in the system.' },
        { status: 500 }
      );
    }

    // 3. Resolve Service Area if provided
    let areaId: number | null = null;
    if (areaSlug) {
      const area = await prisma.serviceArea.findUnique({
        where: { slug: areaSlug },
      });
      if (area) {
        areaId = area.id;
      }
    }

    // 4. Generate guaranteed unique booking code
    let bookingCode = generateBookingCode();
    let codeExists = await prisma.booking.findUnique({ where: { bookingCode } });
    while (codeExists) {
      bookingCode = generateBookingCode();
      codeExists = await prisma.booking.findUnique({ where: { bookingCode } });
    }

    // Parse date if given
    let parsedDate: Date | null = null;
    if (preferredDate) {
      const d = new Date(preferredDate);
      if (!isNaN(d.getTime())) {
        parsedDate = d;
      }
    }

    // 5. Create Booking record
    const newBooking = await prisma.booking.create({
      data: {
        bookingCode,
        customerId: customer.id,
        serviceId: service.id,
        areaId,
        deviceType: deviceType.trim(),
        brand: brand && brand.trim() !== '' ? brand.trim() : null,
        model: model && model.trim() !== '' ? model.trim() : null,
        problem: problem.trim(),
        serviceMode,
        preferredDate: parsedDate,
        preferredSlot: preferredSlot && preferredSlot.trim() !== '' ? preferredSlot.trim() : null,
        address: address && address.trim() !== '' ? address.trim() : null,
        status: 'pending',
        source: 'website',
      },
      include: {
        service: true,
      },
    });

    // 6. Record Initial Status History
    await prisma.bookingStatusHistory.create({
      data: {
        bookingId: newBooking.id,
        fromStatus: 'pending',
        toStatus: 'pending',
        changedBy: 'Customer (Online Booking)',
        note: `Initial diagnostic booking submitted online via problem selector: ${problem.trim()}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Repair booking successfully created!',
      booking: {
        id: newBooking.id,
        bookingCode: newBooking.bookingCode,
        deviceType: newBooking.deviceType,
        problem: newBooking.problem,
        serviceName: service.name,
        serviceMode: newBooking.serviceMode,
        status: newBooking.status,
        createdAt: newBooking.createdAt,
      },
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while booking your repair. Please try again.' },
      { status: 500 }
    );
  }
}
