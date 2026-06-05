import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { query, transaction } from '@/lib/db/postgres';

export async function GET(request: NextRequest) {
  try {
    // Step 1: Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const jobType = searchParams.get('job_type');
    const experienceLevel = searchParams.get('experience_level');
    const salaryMin = searchParams.get('salary_min');
    const salaryMax = searchParams.get('salary_max');
    const companyId = searchParams.get('company_id');
    const mine = searchParams.get('mine') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // Step 2: Check if user is logged in
    const token = request.cookies.get('auth_token')?.value;
    let userId = null;
    let userRole = null;
    let params: any[] = [];
    let paramIndex = 1;
    
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        userId = payload.userId;
        userRole = payload.role;
      }
    }
    
    // Step 3: Build the query
    let sql = `
      SELECT 
        j.id,
        j.title,
        j.location,
        j.job_type,
        j.experience_level,
        j.salary_min,
        j.salary_max,
        j.salary_currency,
        j.status,
        j.posted_date,
        j.closing_date,
        j.views_count,
        j.applications_count,
        (SELECT COUNT(*) FROM applications a2 WHERE a2.job_id = j.id AND a2.status = 'shortlisted') as shortlisted,
        j.is_featured,
        c.id as company_id,
        c.name as company_name,
        c.logo_url as company_logo,
        c.industry as company_industry
    `;
    
    // If candidate, check if they've applied
    if (userId && userRole === 'candidate') {
      sql += `,
        CASE WHEN a.id IS NOT NULL THEN true ELSE false END as has_applied
      `;
    }
    
    sql += `
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
    `;
    
    // If candidate, join with applications
    if (userId && userRole === 'candidate') {
      sql += ` LEFT JOIN applications a ON a.job_id = j.id AND a.candidate_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }
    
    if (mine && userId && userRole === 'recruiter') {
      sql += ` WHERE j.recruiter_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    } else {
      sql += ` WHERE j.status = 'active' AND j.posted_date <= CURRENT_TIMESTAMP`;
    }
    
    // Add filters
    if (search) {
      sql += ` AND (j.title ILIKE $${paramIndex} OR j.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (location) {
      sql += ` AND j.location ILIKE $${paramIndex}`;
      params.push(`%${location}%`);
      paramIndex++;
    }
    
    if (jobType) {
      sql += ` AND j.job_type = $${paramIndex}`;
      params.push(jobType);
      paramIndex++;
    }
    
    if (experienceLevel) {
      sql += ` AND j.experience_level = $${paramIndex}`;
      params.push(experienceLevel);
      paramIndex++;
    }
    
    if (salaryMin) {
      sql += ` AND j.salary_min >= $${paramIndex}`;
      params.push(parseInt(salaryMin));
      paramIndex++;
    }
    
    if (salaryMax) {
      sql += ` AND j.salary_max <= $${paramIndex}`;
      params.push(parseInt(salaryMax));
      paramIndex++;
    }
    
    if (companyId) {
      sql += ` AND j.company_id = $${paramIndex}`;
      params.push(parseInt(companyId));
      paramIndex++;
    }
    
    // Step 4: Add ordering and pagination
    sql += ` ORDER BY j.is_featured DESC, j.posted_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    // Step 5: Execute main query
    const result = await query(sql, params);
    
    // Step 6: Get total count for pagination
    let countSql = `
      SELECT COUNT(*) as total 
      FROM jobs j
    `;
    
    const countParams: any[] = [];
    let countIndex = 1;
    
    if (mine && userRole === 'recruiter' && userId) {
      countSql += ` WHERE j.recruiter_id = $${countIndex}`;
      countParams.push(userId);
      countIndex++;
    } else {
      countSql += ` WHERE j.status = 'active' AND j.posted_date <= CURRENT_TIMESTAMP`;
    }
    
    if (search) {
      countSql += ` AND (j.title ILIKE $${countIndex} OR j.description ILIKE $${countIndex})`;
      countParams.push(`%${search}%`);
      countIndex++;
    }
    
    if (location) {
      countSql += ` AND j.location ILIKE $${countIndex}`;
      countParams.push(`%${location}%`);
      countIndex++;
    }
    
    if (jobType) {
      countSql += ` AND j.job_type = $${countIndex}`;
      countParams.push(jobType);
      countIndex++;
    }

    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0]?.total || '0');
    
    // Step 7: Return response
    return NextResponse.json({
      success: true,
      data: {
        jobs: result.rows,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      },
    });
    
  } catch (error) {
    console.error('Get jobs error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new job (Recruiter only)
export async function POST(request: NextRequest) {
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
    if (!payload || payload.role !== 'recruiter') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Recruiters only.' },
        { status: 403 }
      );
    }
    
    const userId = payload.userId;
    const body = await request.json();
    
    // Step 2: Validate required fields
    const {
      title,
      description,
      requirements,
      responsibilities,
      benefits,
      location,
      is_remote,
      salary_min,
      salaryMin,
      salary_max,
      salaryMax,
      salary_currency,
      job_type,
      jobType,
      work_type,
      experience_level,
      experienceLevel,
      closing_date,
      closingDate,
      status,
      skills,
    } = body;
    const normalizedSalaryMin = salary_min ?? salaryMin;
    const normalizedSalaryMax = salary_max ?? salaryMax;
    const normalizedClosingDate = closing_date ?? closingDate;
    const normalizedJobType = job_type ?? jobType;
    const normalizedExperienceLevel = experience_level ?? experienceLevel;
    const parsedSalaryMin = Number(normalizedSalaryMin);
    const parsedSalaryMax = Number(normalizedSalaryMax);
    
    if (!title || !description || !location) {
      return NextResponse.json(
        { success: false, message: 'Title, description, and location are required' },
        { status: 400 }
      );
    }

    if (
      normalizedSalaryMin === undefined ||
      normalizedSalaryMin === '' ||
      normalizedSalaryMax === undefined ||
      normalizedSalaryMax === '' ||
      normalizedClosingDate === undefined ||
      normalizedClosingDate === ''
    ) {
      return NextResponse.json(
        { success: false, message: 'Salary range and closing date are required' },
        { status: 400 }
      );
    }

    if (!Number.isFinite(parsedSalaryMin) || !Number.isFinite(parsedSalaryMax) || parsedSalaryMin < 0 || parsedSalaryMax < 0 || parsedSalaryMax < parsedSalaryMin) {
      return NextResponse.json(
        { success: false, message: 'Enter a valid salary range' },
        { status: 400 }
      );
    }
    
    // Step 3: Check if recruiter has a company
    const companyResult = await query(
      'SELECT id FROM companies WHERE user_id = $1',
      [userId]
    );
    
    if (companyResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please create a company profile first' },
        { status: 400 }
      );
    }
    
    const companyId = companyResult.rows[0].id;
    
    // Step 4: Create job using transaction
    const result = await transaction(async (client) => {
      // Insert job
      const jobResult = await client.query(
        `INSERT INTO jobs 
         (company_id, recruiter_id, title, description, requirements, 
          responsibilities, benefits, location, is_remote, salary_min, 
          salary_max, salary_currency, job_type, work_type, experience_level, 
          closing_date, status, posted_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          companyId,
          userId,
          title,
          description,
          Array.isArray(requirements) ? requirements.filter(Boolean).join('\n') : requirements || null,
          Array.isArray(responsibilities) ? responsibilities.filter(Boolean).join('\n') : responsibilities || null,
          Array.isArray(benefits) ? benefits.filter(Boolean).join('\n') : benefits || null,
          location,
          is_remote || false,
          parsedSalaryMin,
          parsedSalaryMax,
          salary_currency || 'USD',
          normalizedJobType || 'full-time',
          work_type || 'onsite',
          normalizedExperienceLevel || 'mid',
          normalizedClosingDate,
          status === 'draft' ? 'draft' : 'active'
        ]
      );
      
      const job = jobResult.rows[0];
      
      // Insert skills if provided
      if (skills && skills.length > 0) {
        for (const skill of skills) {
          await client.query(
            `INSERT INTO job_skills (job_id, skill_id, is_required)
             VALUES ($1, $2, $3)`,
            [job.id, skill.id, skill.is_required !== false]
          );
        }
      }
      
      return job;
    });
    
    return NextResponse.json({
      success: true,
      message: 'Job posted successfully',
      data: result,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
