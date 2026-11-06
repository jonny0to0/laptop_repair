import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const customerId = parseInt(id, 10);
    if (isNaN(customerId)) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        bookings: {
          orderBy: { createdAt: 'desc' },
          include: { service: true },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Fetch customer error:', error);
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const customerId = parseInt(id, 10);
    if (isNaN(customerId)) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
    }

    const body = await req.json();
    const { name, mobile, email, address, status, notes } = body;

    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(mobile ? { mobile: mobile.trim() } : {}),
        ...(email !== undefined ? { email: email && email.trim() !== '' ? email.trim() : null } : {}),
        ...(address !== undefined ? { address: address && address.trim() !== '' ? address.trim() : null } : {}),
        ...(status ? { status: status.trim() } : {}),
        ...(notes !== undefined ? { notes: notes && notes.trim() !== '' ? notes.trim() : null } : {}),
      },
    });

    return NextResponse.json({ success: true, customer: updatedCustomer });
  } catch (error) {
    console.error('Update customer error:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only owners/administrators can delete customer records.' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const customerId = parseInt(id, 10);
    if (isNaN(customerId)) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true, name: true, mobile: true },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    await prisma.customer.delete({
      where: { id: customerId },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'DELETE_CUSTOMER',
        entity: 'Customer',
        entityId: String(customerId),
        details: `Deleted customer record for ${customer.name} (${customer.mobile})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Customer ${customer.name} deleted successfully`,
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
