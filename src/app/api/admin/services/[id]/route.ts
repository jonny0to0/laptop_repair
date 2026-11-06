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
    const serviceId = parseInt(id, 10);
    if (isNaN(serviceId)) {
      return NextResponse.json({ error: 'Invalid service ID' }, { status: 400 });
    }

    const body = await req.json();
    const {
      name,
      slug,
      shortDesc,
      fullDesc,
      icon,
      priceMode,
      priceText,
      faqJson,
      metaTitle,
      metaDescription,
      sortOrder,
      isActive,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name.trim();
    if (slug !== undefined) {
      updateData.slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    }
    if (shortDesc !== undefined) updateData.shortDesc = shortDesc.trim();
    if (fullDesc !== undefined) updateData.fullDesc = fullDesc.trim();
    if (icon !== undefined) updateData.icon = icon;
    if (priceMode !== undefined) updateData.priceMode = priceMode;
    if (priceText !== undefined) updateData.priceText = priceText ? priceText.trim() : null;
    if (faqJson !== undefined) updateData.faqJson = faqJson;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle ? metaTitle.trim() : null;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription ? metaDescription.trim() : null;
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder, 10);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'UPDATE_SERVICE',
        entity: 'Service',
        entityId: String(serviceId),
        details: `Updated service: ${updatedService.name}`,
      },
    });

    return NextResponse.json({ success: true, service: updatedService });
  } catch (error) {
    console.error('Update service error:', error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can delete services' }, { status: 403 });
    }

    const { id } = await context.params;
    const serviceId = parseInt(id, 10);
    if (isNaN(serviceId)) {
      return NextResponse.json({ error: 'Invalid service ID' }, { status: 400 });
    }

    // Check if bookings exist
    const bookingCount = await prisma.booking.count({
      where: { serviceId },
    });

    if (bookingCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete service because it is linked to ${bookingCount} existing bookings. Deactivate it instead.` },
        { status: 400 }
      );
    }

    await prisma.service.delete({
      where: { id: serviceId },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'DELETE_SERVICE',
        entity: 'Service',
        entityId: String(serviceId),
        details: `Deleted service ID ${serviceId}`,
      },
    });

    return NextResponse.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    console.error('Delete service error:', error);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
