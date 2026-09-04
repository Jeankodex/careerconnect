
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { query, transaction } from '@/lib/db/postgres';
import { calculateProfileCompletion } from '@/lib/candidate/profileCompletion';

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
    
    // Step 6: Calculate profile completion percentage from all editable profile details.
    const completionPercentage = calculateProfileCompletion(profile, skillsResult.rows.length);
    
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

    const normalizeSkillLevel = (value: unknown) => {
      if (typeof value === 'number' && Number.isFinite(value)) {
        return Math.min(Math.max(Math.round(value), 1), 5);
      }
      if (typeof value === 'string') {
        const normalized = value.toLowerCase();
        if (normalized.includes('beginner')) return 1;
        if (normalized.includes('intermediate')) return 2;
        if (normalized.includes('advanced')) return 3;
        if (normalized.includes('expert')) return 4;
      }
      return 2;
    };

    const normalizeSkillName = (value: unknown) => {
      if (typeof value === 'string') {
        return value.trim();
      }
      if (typeof value === 'object' && value !== null && 'name' in value) {
        return String((value as any).name).trim();
      }
      return '';
    };

    const skillItems = Array.isArray(body.skills)
      ? body.skills.map((skill: any) => ({
          name: normalizeSkillName(skill),
          proficiency_level: normalizeSkillLevel(skill.level ?? skill.proficiency_level),
        })).filter((skill: { name: string }) => skill.name.length > 0)
      : null;

    const userId = payload.userId;
    
    await transaction(async (client) => {
      // Step 3: Check if profile exists and insert or update
      const existingProfile = await client.query(
        'SELECT id FROM candidate_profiles WHERE user_id = $1',
        [userId]
      );

      if (existingProfile.rows.length > 0) {
        await client.query(
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
        await client.query(
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

      if (skillItems !== null) {
        await client.query('DELETE FROM candidate_skills WHERE candidate_id = $1', [userId]);

        for (const skill of skillItems) {
          const insertSkill = await client.query(
            `INSERT INTO skills (name) VALUES ($1)
             ON CONFLICT (name) DO NOTHING
             RETURNING id`,
            [skill.name]
          );

          let skillId = insertSkill.rows[0]?.id;
          if (!skillId) {
            const existingSkill = await client.query(
              'SELECT id FROM skills WHERE name = $1',
              [skill.name]
            );
            skillId = existingSkill.rows[0]?.id;
          }

          if (!skillId) continue;

          await client.query(
            `INSERT INTO candidate_skills (candidate_id, skill_id, proficiency_level)
             VALUES ($1, $2, $3)`,
            [userId, skillId, skill.proficiency_level]
          );
        }
      }
    });

    // Step 5: Fetch updated profile and skills
    const updatedProfile = await query(
      `SELECT first_name, last_name, phone, location, headline, summary, 
              resume_url, profile_picture, years_experience, current_job_title, 
              current_company, linkedin_url, github_url, portfolio_url, education, work_experience, updated_at
       FROM candidate_profiles WHERE user_id = $1`,
      [userId]
    );

    const updatedSkills = await query(
      `SELECT s.id, s.name, s.category, cs.proficiency_level
       FROM candidate_skills cs
       JOIN skills s ON cs.skill_id = s.id
       WHERE cs.candidate_id = $1
       ORDER BY s.category, s.name`,
      [userId]
    );

    const completionPercentage = calculateProfileCompletion(updatedProfile.rows[0] || null, updatedSkills.rows.length);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        profile: updatedProfile.rows[0],
        skills: updatedSkills.rows,
        profile_completion: completionPercentage,
      },
    });
    
  } catch (error) {
    console.error('Update candidate profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
