import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSession } from '@/lib/auth';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid email or password format' },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const waitMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / (1000 * 60)
      );
      return NextResponse.json(
        { error: `Account is temporarily locked. Try again in ${waitMinutes} minutes.` },
        { status: 423 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      const newAttempts = user.failedAttempts + 1;
      const lockedUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: newAttempts,
          lockedUntil: lockedUntil,
        },
      });

      return NextResponse.json(
        {
          error:
            newAttempts >= 5
              ? 'Too many failed attempts. Account locked for 15 minutes.'
              : 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Reset failed attempts & update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Create session token & set cookie
    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'login',
        entity: 'user',
        entityId: String(user.id),
        details: 'Successful administrator login',
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during authentication' },
      { status: 500 }
    );
  }
}
