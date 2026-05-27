import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db/postgres';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.issues },
        { status: 400 }
      );
    }

    const email = validation.data.email.toLowerCase();
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const result = await query(
      `UPDATE users
       SET password_reset_token = $1,
           password_reset_expires = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE LOWER(email) = LOWER($3) AND is_active = true
       RETURNING id`,
      [tokenHash, expiresAt, email]
    );

    if (result.rowCount && process.env.NODE_ENV !== 'production') {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
      console.info(`Password reset link for ${email}: ${appUrl}/reset-password?token=${token}`);
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
