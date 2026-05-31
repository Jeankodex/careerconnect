
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { query } from '@/lib/db/postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jobId = parseInt(id);
    
    if (isNaN(jobId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid job ID' },
        { status: 400 }
      );
    }
    
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
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Step 2: Verify job ownership
    const jobCheck = await query(
      'SELECT recruiter_id, title FROM jobs WHERE id = $1',
      [jobId]
    );
    
    if (jobCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Job not found' },
        { status: 404 }
      );
    }
    
    if (jobCheck.rows[0].recruiter_id !== payload.userId) {
      return NextResponse.json(
        { success: false, message: 'You can only view applicants for your own jobs' },
        { status: 403 }
      );
    }
    
    const jobTitle = jobCheck.rows[0].title;
    
    // Step 3: Get query parameters
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // Step 4: Build query for applicants
    let sql = `
      SELECT 
        a.id,
        a.cover_letter,
        a.resume_url,
        a.status,
        a.applied_date,
        a.reviewed_at,
        a.notes,
        a.rating,
        a.interview_date,
        a.interview_type,
        u.id as candidate_id,
        u.email as candidate_email,
        u.created_at as candidate_joined,
        cp.first_name,
        cp.last_name,
        cp.phone,
        cp.location,
        cp.headline,
        cp.years_experience,
        cp.current_job_title,
        cp.current_company,
        cp.linkedin_url,
        cp.github_url,
        cp.portfolio_url,
        (SELECT STRING_AGG(s.name, ', ') 
         FROM candidate_skills cs 
         JOIN skills s ON cs.skill_id = s.id 
         WHERE cs.candidate_id = u.id) as skills
      FROM applications a
      JOIN users u ON a.candidate_id = u.id
      JOIN candidate_profiles cp ON u.id = cp.user_id
      WHERE a.job_id = $1
    `;
    
    const params: any[] = [jobId];
    let paramIndex = 2;
    
    if (statusFilter) {
      sql += ` AND a.status = $${paramIndex}`;
      params.push(statusFilter);
      paramIndex++;
    }
    
    sql += ` ORDER BY 
      CASE a.status 
        WHEN 'pending' THEN 1 
        WHEN 'reviewed' THEN 2 
        WHEN 'shortlisted' THEN 3 
        WHEN 'interview' THEN 4 
        WHEN 'hired' THEN 5 
        WHEN 'rejected' THEN 6 
      END,
      a.applied_date ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    
    params.push(limit, offset);
    
    // Step 5: Execute query
    const result = await query(sql, params);
    
    // Step 6: Get status counts for pipeline view
    const statusCounts = await query(
      `SELECT status, COUNT(*) as count 
       FROM applications 
       WHERE job_id = $1 
       GROUP BY status`,
      [jobId]
    );
    
    const pipeline = {
      total: 0,
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      interview: 0,
      hired: 0,
      rejected: 0,
    };
    
    statusCounts.rows.forEach(row => {
      pipeline.total += parseInt(row.count);
      if (row.status in pipeline) {
        pipeline[row.status as keyof typeof pipeline] = parseInt(row.count);
      }
    });
    
    // Step 7: Get total count for pagination
    let countSql = 'SELECT COUNT(*) as total FROM applications WHERE job_id = $1';
    const countParams: any[] = [jobId];
    let countIndex = 2;
    
    if (statusFilter) {
      countSql += ` AND status = $${countIndex}`;
      countParams.push(statusFilter);
      countIndex++;
    }
    
    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0]?.total || '0');
    
    // Step 8: Return response
    return NextResponse.json({
      success: true,
      data: {
        job: {
          id: jobId,
          title: jobTitle,
        },
        applicants: result.rows,
        pipeline,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      },
    });
    
  } catch (error) {
    console.error('Get applicants error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}