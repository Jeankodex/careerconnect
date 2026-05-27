
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { query } from '@/lib/db/postgres';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    // Get user from database
    const result = await query(
      `SELECT id, email, role, is_active, email_verified, created_at, last_login 
       FROM users 
       WHERE id = $1 AND is_active = true`,
      [payload.userId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found or inactive' },
        { status: 404 }
      );
    }
    
    const user = result.rows[0];
    
    // Get profile based on role
    let profile = null;
    if (user.role === 'candidate') {
      const profileResult = await query(
        'SELECT first_name, last_name, headline, location FROM candidate_profiles WHERE user_id = $1',
        [user.id]
      );
      profile = profileResult.rows[0];
    } else if (user.role === 'recruiter') {
      const profileResult = await query(
        'SELECT first_name, last_name, department, position FROM recruiter_profiles WHERE user_id = $1',
        [user.id]
      );
      profile = profileResult.rows[0];
    }
    
    return NextResponse.json({
      success: true,
      data: {
        user,
        profile,
      },
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}