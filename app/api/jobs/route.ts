import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { query } from '@/lib/db/postgres';

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
    
    sql += ` WHERE j.status = 'active' AND j.posted_date <= CURRENT_TIMESTAMP`;
    
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
      WHERE j.status = 'active' AND j.posted_date <= CURRENT_TIMESTAMP
    `;
    
    const countParams: any[] = [];
    let countIndex = 1;
    
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