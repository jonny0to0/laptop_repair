import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { ReviewStatus } from '@/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const reviewId = parseInt(id, 10);
    if (isNaN(reviewId)) {
      return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 });
    }

    const body = await req.json();
    const { status, isFeatured, ownerReply } = body;

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status as ReviewStatus;
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (ownerReply !== undefined) updateData.ownerReply = ownerReply ? ownerReply.trim() : null;

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'UPDATE_REVIEW',
        entity: 'Review',
        entityId: String(reviewId),
        details: `Updated review status to ${status || 'unchanged'}, featured: ${isFeatured}`,
      },
    });

    return NextResponse.json({ success: true, review: updated });
  } catch (error) {
    console.error('Update review error:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can delete reviews' }, { status: 403 });
    }

    const { id } = await context.params;
    const reviewId = parseInt(id, 10);
    if (isNaN(reviewId)) {
      return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 });
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
