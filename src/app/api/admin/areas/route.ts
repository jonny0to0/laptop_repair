import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const areas = await prisma.serviceArea.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    return NextResponse.json({ areas });
  } catch (error) {
    console.error('Fetch areas error:', error);
    return NextResponse.json({ error: 'Failed to fetch areas' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug, pincodes, description, sortOrder, isActive } = body;

    if (!name || !pincodes) {
      return NextResponse.json({ error: 'Name and pincodes are required' }, { status: 400 });
    }

    const cleanSlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
      : name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    const existing = await prisma.serviceArea.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json({ error: 'An area with this slug already exists' }, { status: 400 });
    }

    const newArea = await prisma.serviceArea.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        pincodes: pincodes.trim(),
        description: description ? description.trim() : null,
        sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'CREATE_SERVICE_AREA',
        entity: 'ServiceArea',
        entityId: String(newArea.id),
        details: `Created service area: ${newArea.name} with pincodes: ${newArea.pincodes}`,
      },
    });

    return NextResponse.json({ success: true, area: newArea });
  } catch (error) {
    console.error('Create area error:', error);
    return NextResponse.json({ error: 'Failed to create area' }, { status: 500 });
  }
}
