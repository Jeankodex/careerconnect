import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { query } from '@/lib/db/postgres';

export async function GET(request: NextRequest) {
  try {
    // STEP 1: Get the auth token from cookies
    const token = request.cookies.get('auth_token')?.value;
    
    // STEP 2: If no token, user is not logged in
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // STEP 3: Verify the token (checks if it's valid and not expired)
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    // STEP 4: Fetch user from database using the userId from token
    const userResult = await query(
      `SELECT id, email, role, is_active, email_verified, created_at, last_login 
       FROM users 
       WHERE id = $1`,
      [payload.userId]
    );
    
    // STEP 5: If user doesn't exist in database (shouldn't happen, but check)
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    const user = userResult.rows[0];
    
    // STEP 6: Fetch role-specific profile
    let profile = null;
    
    if (user.role === 'candidate') {
      const profileResult = await query(
        `SELECT first_name, last_name, phone, location, headline, summary, 
                resume_url, profile_picture, years_experience, current_job_title, 
                current_company, linkedin_url, github_url, portfolio_url,
                education, work_experience
         FROM candidate_profiles 
         WHERE user_id = $1`,
        [user.id]
      );
      profile = profileResult.rows[0] || null;
      
    } else if (user.role === 'recruiter') {
      const profileResult = await query(
        `SELECT first_name, last_name, phone, department, position, profile_picture, linkedin_url
         FROM recruiter_profiles 
         WHERE user_id = $1`,
        [user.id]
      );
      profile = profileResult.rows[0] || null;
      
      // Also fetch company info if recruiter has one
      if (profile) {
        const companyResult = await query(
          `SELECT id, name, logo_url, industry, headquarters AS location
           FROM companies 
           WHERE user_id = $1`,
          [user.id]
        );
        if (companyResult.rows[0]) {
          profile.company = companyResult.rows[0];
        }
      }
      
    } else if (user.role === 'admin') {
      // Admin doesn't have a profile table, but we still return basic info
      profile = {
        role: 'admin',
        name: 'Administrator',
      };
    }
    
    // STEP 7: Return combined user and profile data
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          is_active: user.is_active,
          email_verified: user.email_verified,
          created_at: user.created_at,
          last_login: user.last_login,
        },
        profile: profile,
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