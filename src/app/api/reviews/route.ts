import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ReviewSubmitSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, 'Review comment must be at least 10 characters').max(1000),
  bookingCode: z.string().optional(),
});

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { status: 'approved' },
      orderBy: { createdAt: 'desc' },
      include: { service: true },
    });

    const totalCount = reviews.length;
    const averageRating =
      totalCount > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1))
        : 0;

    return NextResponse.json({
      reviews,
      totalCount,
      averageRating,
    });
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = ReviewSubmitSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid form data' },
        { status: 400 }
      );
    }

    const { customerName, rating, comment, bookingCode } = result.data;

    let bookingId: number | null = null;
    let serviceId: number | null = null;

    if (bookingCode) {
      const foundBooking = await prisma.booking.findUnique({
        where: { bookingCode: bookingCode.trim().toUpperCase() },
      });
      if (foundBooking) {
        bookingId = foundBooking.id;
        serviceId = foundBooking.serviceId;
      }
    }

    const created = await prisma.review.create({
      data: {
        customerName: customerName.trim(),
        rating,
        comment: comment.trim(),
        status: 'pending', // Requires admin approval per Section 4.6 & Section 12
        bookingId,
        serviceId,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        'Thank you! Your review has been submitted and will appear on the site once verified by our team.',
      reviewId: created.id,
    });
  } catch (error) {
    console.error('Failed to submit review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
