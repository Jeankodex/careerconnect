
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { query } from '@/lib/db/postgres';

export async function GET(request: NextRequest) {
  try {
    // Step 1: Verify user is authenticated
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    // Step 2: Verify user is a candidate
    if (payload.role !== 'candidate') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Candidate only.' },
        { status: 403 }
      );
    }
    
    const userId = payload.userId;
    
    // Step 3: Fetch user basic info
    const userResult = await query(
      `SELECT id, email, created_at, last_login 
       FROM users WHERE id = $1`,
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    const user = userResult.rows[0];
    
    // Step 4: Fetch candidate profile
    const profileResult = await query(
      `SELECT first_name, last_name, phone, location, headline, summary, 
              resume_url, profile_picture, years_experience, current_job_title, 
              current_company, linkedin_url, github_url, portfolio_url,
              education, work_experience,
              created_at as profile_created_at, updated_at as profile_updated_at
       FROM candidate_profiles 
       WHERE user_id = $1`,
      [userId]
    );
    
    const profile = profileResult.rows[0] || null;
    
    // Step 5: Fetch candidate's skills
    const skillsResult = await query(
      `SELECT s.id, s.name, s.category, cs.proficiency_level
       FROM candidate_skills cs
       JOIN skills s ON cs.skill_id = s.id
       WHERE cs.candidate_id = $1
       ORDER BY s.category, s.name`,
      [userId]
    );
    
    // Step 6: Calculate profile completion percentage
    let completionPercentage = 0;
    let completedFields = 0;
    let totalFields = 8; // name, phone, location, headline, summary, experience, skills, resume
    
    if (profile) {
      if (profile.first_name && profile.last_name) completedFields++;
      if (profile.phone) completedFields++;
      if (profile.location) completedFields++;
      if (profile.headline) completedFields++;
      if (profile.summary) completedFields++;
      if (profile.years_experience > 0) completedFields++;
      if (skillsResult.rows.length > 0) completedFields++;
      if (profile.resume_url) completedFields++;
      
      completionPercentage = Math.round((completedFields / totalFields) * 100);
    }
    
    // Step 7: Return complete profile data
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          joined_date: user.created_at,
          last_login: user.last_login,
        },
        profile: profile,
        skills: skillsResult.rows,
        profile_completion: completionPercentage,
      },
    });
    
  } catch (error) {
    console.error('Get candidate profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Step 1: Verify authentication
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'candidate') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Step 2: Get request body
    const body = await request.json();
    const {
      first_name,
      last_name,
      phone,
      location,
      headline,
      summary,
      years_experience,
      current_job_title,
      current_company,
      linkedin_url,
      github_url,
      portfolio_url,
      education,
      work_experience,
    } = body;
    
    const parsedYearsExperience = years_experience === null || years_experience === undefined
      ? null
      : Number(years_experience);
    const safeYearsExperience = Number.isFinite(parsedYearsExperience)
      ? parsedYearsExperience
      : null;

    const normalizeWorkExperience = (value: unknown) => {
      if (Array.isArray(value)) {
        return value.map((item) => {
          if (typeof item === 'string') {
            try {
              return JSON.parse(item);
            } catch {
              return item;
            }
          }
          return item;
        });
      }

      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            return parsed.map((item) => {
              if (typeof item === 'string') {
                try {
                  return JSON.parse(item);
                } catch {
                  return item;
                }
              }
              return item;
            });
          }
        } catch {
          return null;
        }
      }

      return null;
    };

    const safeWorkExperience = normalizeWorkExperience(work_experience);
    const workExperienceJson = safeWorkExperience !== null ? JSON.stringify(safeWorkExperience) : null;

    const userId = payload.userId;
    
    // Step 3: Check if profile exists
    const existingProfile = await query(
      'SELECT id FROM candidate_profiles WHERE user_id = $1',
      [userId]
    );
    
    // Step 4: Update or insert profile
    if (existingProfile.rows.length > 0) {
      // Update existing profile
      await query(
        `UPDATE candidate_profiles 
         SET first_name = $1, last_name = $2, phone = $3, location = $4, 
             headline = $5, summary = $6, years_experience = $7, 
             current_job_title = $8, current_company = $9, 
             linkedin_url = $10, github_url = $11, portfolio_url = $12,
             education = $13, work_experience = $14,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $15`,
        [
          first_name, last_name, phone, location, headline, summary, 
          safeYearsExperience, current_job_title, current_company,
          linkedin_url, github_url, portfolio_url, education, workExperienceJson, userId
        ]
      );
    } else {
      // Create new profile
      await query(
        `INSERT INTO candidate_profiles 
         (user_id, first_name, last_name, phone, location, headline, summary, 
          years_experience, current_job_title, current_company, 
          linkedin_url, github_url, portfolio_url, education, work_experience)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          userId, first_name, last_name, phone, location, headline, summary,
          safeYearsExperience, current_job_title, current_company,
          linkedin_url, github_url, portfolio_url, education, workExperienceJson
        ]
      );
    }
    
    // Step 5: Fetch updated profile
    const updatedProfile = await query(
      `SELECT first_name, last_name, phone, location, headline, summary, 
              resume_url, profile_picture, years_experience, current_job_title, 
              current_company, linkedin_url, github_url, portfolio_url, education, work_experience, updated_at
       FROM candidate_profiles WHERE user_id = $1`,
      [userId]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile.rows[0],
    });
    
  } catch (error) {
    console.error('Update candidate profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}