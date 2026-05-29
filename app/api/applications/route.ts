import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { query } from '@/lib/db/postgres';

export async function GET(request: NextRequest) {
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
    
    // Step 2: Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // Step 3: Build query
    let sql = `
      SELECT 
        a.id,
        a.cover_letter,
        a.status,
        a.applied_date,
        a.reviewed_at,
        a.notes as recruiter_notes,
        j.id as job_id,
        j.title as job_title,
        j.location as job_location,
        j.job_type,
        j.salary_min,
        j.salary_max,
        c.id as company_id,
        c.name as company_name,
        c.logo_url as company_logo,
        c.industry as company_industry
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      WHERE a.candidate_id = $1
    `;
    
    const params: any[] = [payload.userId];
    let paramIndex = 2;
    
    if (status) {
      sql += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    sql += ` ORDER BY a.applied_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    // Step 4: Execute query
    const result = await query(sql, params);
    
    // Step 5: Get total count for pagination
    let countSql = `
      SELECT COUNT(*) as total 
      FROM applications 
      WHERE candidate_id = $1
    `;
    
    const countParams: any[] = [payload.userId];
    let countIndex = 2;
    
    if (status) {
      countSql += ` AND status = $${countIndex}`;
      countParams.push(status);
      countIndex++;
    }
    
    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0]?.total || '0');
    
    // Step 6: Get status counts for dashboard
    const statusCounts = await query(
      `SELECT status, COUNT(*) as count 
       FROM applications 
       WHERE candidate_id = $1 
       GROUP BY status`,
      [payload.userId]
    );
    
    const statusSummary = {
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      rejected: 0,
      hired: 0,
    };
    
    statusCounts.rows.forEach(row => {
      if (row.status in statusSummary) {
        statusSummary[row.status as keyof typeof statusSummary] = parseInt(row.count);
      }
    });
    
    // Step 7: Return response
    return NextResponse.json({
      success: true,
      data: {
        applications: result.rows,
        status_summary: statusSummary,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
        },
      },
    });
    
  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}