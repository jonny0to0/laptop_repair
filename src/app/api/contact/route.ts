import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  mobile: z.string().min(8, 'Enter a valid contact number').max(20),
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
  message: z.string().min(5, 'Message must be at least 5 characters').max(2000),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = ContactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid form input' },
        { status: 400 }
      );
    }

    const { name, mobile, email, message } = result.data;

    const created = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        mobile: mobile.trim(),
        email: email && email.trim() !== '' ? email.trim() : null,
        message: message.trim(),
        status: 'new',
      },
    });

    return NextResponse.json({
      success: true,
      message:
        'Thank you! We have received your message. A workshop technician will contact you during operating hours.',
      id: created.id,
    });
  } catch (error) {
    console.error('Contact submit error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while sending your message.' },
      { status: 500 }
    );
  }
}
