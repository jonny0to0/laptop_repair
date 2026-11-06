import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const services = await prisma.service.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { bookings: true, reviews: true },
        },
      },
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Fetch admin services error:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    const existing = await prisma.service.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json({ error: 'A service with this slug already exists' }, { status: 400 });
    }

    const newService = await prisma.service.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        shortDesc: shortDesc ? shortDesc.trim() : '',
        fullDesc: fullDesc ? fullDesc.trim() : '',
        icon: icon || 'Wrench',
        priceMode: priceMode || 'starts_from',
        priceText: priceText ? priceText.trim() : null,
        faqJson: faqJson || '[]',
        metaTitle: metaTitle ? metaTitle.trim() : null,
        metaDescription: metaDescription ? metaDescription.trim() : null,
        sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'CREATE_SERVICE',
        entity: 'Service',
        entityId: String(newService.id),
        details: `Created repair service: ${newService.name} (${newService.slug})`,
      },
    });

    return NextResponse.json({ success: true, service: newService });
  } catch (error) {
    console.error('Create service error:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
