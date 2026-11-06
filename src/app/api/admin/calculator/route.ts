import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [items, settings] = await Promise.all([
      prisma.costCalculatorItem.findMany({
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      }),
      prisma.setting.findMany({
        where: {
          key: {
            in: [
              'calculator_devices',
              'calculator_brands',
              'calculator_brand_multipliers',
              'calculator_brand_category_costs',
            ],
          },
        },
      }),
    ]);

    const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

    let devices = [
      { id: 'Laptop', label: 'Laptop', tagline: 'Windows / Mac / Chromebook', badge: 'Most Popular', multiplier: 1.0 },
      { id: 'Desktop', label: 'Desktop / PC', tagline: 'Tower / All-in-One PC', badge: 'Fast Triage', multiplier: 0.95 },
      { id: 'MacBook', label: 'Apple MacBook', tagline: 'Air / Pro / M1-M3 / Intel', badge: 'Retina & Silicon', multiplier: 1.35 },
      { id: 'Gaming Rig', label: 'Gaming PC', tagline: 'Custom Rig / High-End GPU', badge: 'High Performance', multiplier: 1.15 },
    ];
    if (settingsMap.calculator_devices) {
      try {
        devices = JSON.parse(settingsMap.calculator_devices);
      } catch (e) {
        console.error('Failed to parse calculator_devices:', e);
      }
    }

    let brands = ['Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'Apple', 'MSI', 'Samsung', 'Toshiba', 'Other Brand'];
    if (settingsMap.calculator_brands) {
      try {
        brands = JSON.parse(settingsMap.calculator_brands);
      } catch (e) {
        console.error('Failed to parse calculator_brands:', e);
      }
    }

    let brandMultipliers: Record<string, number> = { Apple: 1.35, MSI: 1.05 };
    if (settingsMap.calculator_brand_multipliers) {
      try {
        brandMultipliers = JSON.parse(settingsMap.calculator_brand_multipliers);
      } catch (e) {
        console.error('Failed to parse calculator_brand_multipliers:', e);
      }
    }

    let brandCategoryCosts: Record<
      string,
      Record<string, { multiplier: number; min?: number; max?: number }>
    > = {};
    if (settingsMap.calculator_brand_category_costs) {
      try {
        brandCategoryCosts = JSON.parse(settingsMap.calculator_brand_category_costs);
      } catch (e) {
        console.error('Failed to parse calculator_brand_category_costs:', e);
      }
    }

    return NextResponse.json({
      items,
      devices,
      brands,
      brandMultipliers,
      brandCategoryCosts,
    });
  } catch (error) {
    console.error('Admin calculator fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch calculator data' }, { status: 500 });
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
      category,
      serviceSlug,
      description,
      baseMin,
      baseMax,
      turnaround,
      warranty,
      icon,
      tag,
      sortOrder,
      isActive,
      tierOptionsJson,
    } = body;

    if (!name || !category || baseMin === undefined || baseMax === undefined) {
      return NextResponse.json(
        { error: 'Name, Category, Minimum Price, and Maximum Price are required.' },
        { status: 400 }
      );
    }

    // Generate unique code from name
    let code = (body.code || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    const existing = await prisma.costCalculatorItem.findUnique({
      where: { code },
    });
    if (existing) {
      code = `${code}_${Date.now().toString().slice(-4)}`;
    }

    const item = await prisma.costCalculatorItem.create({
      data: {
        code,
        name: name.trim(),
        category: category.trim(),
        serviceSlug: serviceSlug?.trim() || 'laptop-repair',
        description: description?.trim() || '',
        baseMin: Math.max(0, parseInt(baseMin, 10) || 0),
        baseMax: Math.max(0, parseInt(baseMax, 10) || 0),
        turnaround: turnaround?.trim() || '1 - 2 Hours',
        warranty: warranty?.trim() || '90-Day Parts & Labor Warranty',
        icon: icon?.trim() || 'Wrench',
        tag: tag?.trim() || null,
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive: isActive !== false,
        tierOptionsJson: tierOptionsJson || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'CREATE_CALCULATOR_ITEM',
        entity: 'CostCalculatorItem',
        entityId: String(item.id),
        details: `Created calculator item: ${item.name} (₹${item.baseMin} - ₹${item.baseMax})`,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Admin create calculator item error:', error);
    return NextResponse.json({ error: 'Failed to create calculator item' }, { status: 500 });
  }
}
