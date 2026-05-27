import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db/postgres';
import { verifyPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { loginSchema } from '@/lib/validations/user.schema';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.issues },
        { status: 400 }
      );
    }
    
    const { password } = validation.data;
    const email = validation.data.email.toLowerCase();
    
    // Get user from database
    const result = await pool.query(
      'SELECT id, email, password_hash, role, is_active FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    const user = result.rows[0];
    
    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { success: false, message: 'Account is disabled' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    // Determine redirect URL based on role
    let redirectUrl = '/';
    if (user.role === 'candidate') {
      redirectUrl = '/candidate/dashboard';
    } else if (user.role === 'recruiter') {
      redirectUrl = '/recruiter/dashboard';
    } else if (user.role === 'admin') {
      redirectUrl = '/admin/dashboard';
    }
    
    // Update last login timestamp
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );
    
    // Log audit
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4)`,
      [user.id, 'login', request.headers.get('x-forwarded-for') || '', request.headers.get('user-agent') || '']
    );
    
    // Create response with redirect URL included
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        redirectUrl: redirectUrl,
      },
    });
    
    // Set HTTP-only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
