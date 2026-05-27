import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db/postgres';
import { hashPassword } from '@/lib/auth/password';
import { registerSchema } from '@/lib/validations/user.schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.issues },
        { status: 400 }
      );
    }
    
    const { password, role, first_name, last_name } = validation.data;
    const email = validation.data.email.toLowerCase();
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert user
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, role, is_active, email_verified) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role, created_at`,
        [email, hashedPassword, role, true, false]
      );
      
      const user = userResult.rows[0];
      
      // Insert profile based on role
      if (role === 'candidate') {
        await client.query(
          `INSERT INTO candidate_profiles (user_id, first_name, last_name) 
           VALUES ($1, $2, $3)`,
          [user.id, first_name, last_name]
        );
      } else if (role === 'recruiter') {
        await client.query(
          `INSERT INTO recruiter_profiles (user_id, first_name, last_name) 
           VALUES ($1, $2, $3)`,
          [user.id, first_name, last_name]
        );
      }
      
      await client.query('COMMIT');
      
      // Create response with redirect URL included
      const response = NextResponse.json({
        success: true,
        message: 'Registration successful',
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          redirectUrl: '/login',
        },
      }, { status: 201 });

      return response;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
