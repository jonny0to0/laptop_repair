import { prisma } from '@/lib/prisma';
import ReviewsClient from './ReviewsClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Reviews & Ratings | ProTech IT',
  description:
    'Read real, verified reviews from laptop and computer repair customers. Unedited feedback and workshop ratings.',
};

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    where: { status: 'approved' },
    orderBy: { createdAt: 'desc' },
    include: { service: true },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="max-w-3xl">
        <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
          Transparency & Proof
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
          Customer Reviews & Workshop Feedback
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
          We believe in honest customer feedback. Every review displayed here is submitted by a real
          repair customer and verified by our workshop.
        </p>
      </div>

      <ReviewsClient initialReviews={reviews} />
    </div>
  );
}
