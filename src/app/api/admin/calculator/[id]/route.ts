import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

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
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.category !== undefined) updateData.category = body.category.trim();
    if (body.serviceSlug !== undefined) updateData.serviceSlug = body.serviceSlug.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.baseMin !== undefined) updateData.baseMin = Math.max(0, parseInt(body.baseMin, 10) || 0);
    if (body.baseMax !== undefined) updateData.baseMax = Math.max(0, parseInt(body.baseMax, 10) || 0);
    if (body.turnaround !== undefined) updateData.turnaround = body.turnaround.trim();
    if (body.warranty !== undefined) updateData.warranty = body.warranty.trim();
    if (body.icon !== undefined) updateData.icon = body.icon.trim();
    if (body.tag !== undefined) updateData.tag = body.tag ? body.tag.trim() : null;
    if (body.sortOrder !== undefined) updateData.sortOrder = parseInt(body.sortOrder, 10) || 0;
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    if (body.tierOptionsJson !== undefined) updateData.tierOptionsJson = body.tierOptionsJson;

    const updated = await prisma.costCalculatorItem.update({
      where: { id: itemId },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'UPDATE_CALCULATOR_ITEM',
        entity: 'CostCalculatorItem',
        entityId: String(itemId),
        details: `Updated calculator item ${updated.name}`,
      },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error('Update calculator item error:', error);
    return NextResponse.json({ error: 'Failed to update calculator item' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'Only business owners can delete calculator items' }, { status: 403 });
    }

    const { id } = await context.params;
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    const deleted = await prisma.costCalculatorItem.delete({
      where: { id: itemId },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'DELETE_CALCULATOR_ITEM',
        entity: 'CostCalculatorItem',
        entityId: String(itemId),
        details: `Deleted calculator item ${deleted.name}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete calculator item error:', error);
    return NextResponse.json({ error: 'Failed to delete calculator item' }, { status: 500 });
  }
}
