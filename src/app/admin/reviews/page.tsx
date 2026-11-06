import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ReviewsClient from './ReviewsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Review Moderation & Testimonials | ProTech Admin',
};

export default async function AdminReviewsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/admin/login');
  }

  const reviews = await prisma.review.findMany({
    include: {
      service: {
        select: { name: true, slug: true },
      },
      booking: {
        select: { bookingCode: true, deviceType: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const serialized = reviews.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return <ReviewsClient initialReviews={serialized} />;
}
