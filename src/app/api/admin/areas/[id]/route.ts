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
    const areaId = parseInt(id, 10);
    if (isNaN(areaId)) {
      return NextResponse.json({ error: 'Invalid area ID' }, { status: 400 });
    }

    const body = await req.json();
    const { name, slug, pincodes, description, sortOrder, isActive } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (slug !== undefined) {
      updateData.slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    }
    if (pincodes !== undefined) updateData.pincodes = pincodes.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder, 10);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await prisma.serviceArea.update({
      where: { id: areaId },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'UPDATE_SERVICE_AREA',
        entity: 'ServiceArea',
        entityId: String(areaId),
        details: `Updated service area: ${updated.name}`,
      },
    });

    return NextResponse.json({ success: true, area: updated });
  } catch (error) {
    console.error('Update area error:', error);
    return NextResponse.json({ error: 'Failed to update area' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can delete areas' }, { status: 403 });
    }

    const { id } = await context.params;
    const areaId = parseInt(id, 10);
    if (isNaN(areaId)) {
      return NextResponse.json({ error: 'Invalid area ID' }, { status: 400 });
    }

    await prisma.serviceArea.delete({
      where: { id: areaId },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'DELETE_SERVICE_AREA',
        entity: 'ServiceArea',
        entityId: String(areaId),
        details: `Deleted service area ID ${areaId}`,
      },
    });

    return NextResponse.json({ success: true, message: 'Area deleted' });
  } catch (error) {
    console.error('Delete area error:', error);
    return NextResponse.json({ error: 'Failed to delete area' }, { status: 500 });
  }
}
