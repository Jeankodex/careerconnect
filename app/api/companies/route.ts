import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    // STEP 1: Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const industry = searchParams.get('industry');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // STEP 2: Check if user is authenticated (for showing their own company)
    const token = request.cookies.get('auth_token')?.value;
    let userId = null;
    let userRole = null;
    
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        userId = payload.userId;
        userRole = payload.role;
      }
    }
    
    // STEP 3: Build the query
    let sql = `
      SELECT 
        c.id, 
        c.name, 
        c.logo_url, 
        c.industry, 
        c.headquarters as location,
        c.is_verified,
        c.website,
        COUNT(DISTINCT j.id) as job_count
      FROM companies c
      LEFT JOIN jobs j ON j.company_id = c.id AND j.status = 'active'
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (search) {
      sql += ` AND c.name ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (industry) {
      sql += ` AND c.industry = $${paramIndex}`;
      params.push(industry);
      paramIndex++;
    }
    
    sql += ` GROUP BY c.id ORDER BY c.name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    // STEP 4: Execute main query
    const result = await query(sql, params);
    
    // STEP 5: Get total count for pagination
    let countSql = `SELECT COUNT(DISTINCT c.id) as total FROM companies c WHERE 1=1`;
    const countParams: any[] = [];
    let countIndex = 1;
    
    if (search) {
      countSql += ` AND c.name ILIKE $${countIndex}`;
      countParams.push(`%${search}%`);
      countIndex++;
    }
    
    if (industry) {
      countSql += ` AND c.industry = $${countIndex}`;
      countParams.push(industry);
      countIndex++;
    }
    
    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0]?.total || '0');
    
    // STEP 6: Get unique industries for filter dropdown
    const industriesResult = await query(
      `SELECT DISTINCT industry FROM companies WHERE industry IS NOT NULL ORDER BY industry`
    );
    const industries = industriesResult.rows.map(row => row.industry);
    
    // STEP 7: If user is a recruiter, get their company info
    let userCompany = null;
    if (userId && userRole === 'recruiter') {
      const companyResult = await query(
        `SELECT id, name, logo_url, industry, headquarters, description, website, is_verified
         FROM companies 
         WHERE user_id = $1`,
        [userId]
      );
      if (companyResult.rows[0]) {
        userCompany = companyResult.rows[0];
      }
    }
    
    // STEP 8: Return response
    return NextResponse.json({
      success: true,
      data: {
        companies: result.rows,
        industries: industries,
        user_company: userCompany,
        pagination: {
          total,
          limit,
          offset,
          has_more: offset + result.rows.length < total,
        },
      },
    });
    
  } catch (error) {
    console.error('Get companies error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}