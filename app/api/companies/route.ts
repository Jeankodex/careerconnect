import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { query, transaction } from '@/lib/db/postgres';

// GET - Fetch recruiter's company
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
    if (!payload || payload.role !== 'recruiter') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Recruiters only.' },
        { status: 403 }
      );
    }
    
    const userId = payload.userId;
    
    // Step 2: Fetch company for this recruiter
    const result = await query(
      `SELECT 
        id, name, description, website, logo_url, cover_image_url,
        industry, size, founded_year, headquarters, phone, email,
        social_linkedin, social_twitter, social_instagram, is_verified,
        created_at, updated_at
       FROM companies 
       WHERE user_id = $1`,
      [userId]
    );
    
    const company = result.rows[0] || null;
    
    // Step 3: If company exists, get job stats
    let jobStats = null;
    if (company) {
      const statsResult = await query(
        `SELECT 
          COUNT(*) as total_jobs,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_jobs,
          SUM(applications_count) as total_applications,
          SUM(views_count) as total_views
         FROM jobs 
         WHERE company_id = $1`,
        [company.id]
      );
      jobStats = statsResult.rows[0];
    }
    
    return NextResponse.json({
      success: true,
      data: {
        company,
        stats: jobStats,
        has_company: !!company,
      },
    });
    
  } catch (error) {
    console.error('Get company error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Create or update company
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
      name,
      description,
      website,
      logo_url,
      cover_image_url,
      industry,
      size,
      founded_year,
      headquarters,
      phone,
      email,
      social_linkedin,
      social_twitter,
      social_instagram,
    } = body;
    
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Company name is required' },
        { status: 400 }
      );
    }
    
    // Step 3: Check if company already exists
    const existingCompany = await query(
      'SELECT id FROM companies WHERE user_id = $1',
      [userId]
    );
    
    let company;
    
    if (existingCompany.rows.length > 0) {
      // UPDATE existing company
      const result = await query(
        `UPDATE companies 
         SET name = $1, description = $2, website = $3, logo_url = $4, 
             cover_image_url = $5, industry = $6, size = $7, founded_year = $8,
             headquarters = $9, phone = $10, email = $11, 
             social_linkedin = $12, social_twitter = $13, social_instagram = $14,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $15
         RETURNING *`,
        [
          name, description, website, logo_url, cover_image_url,
          industry, size, founded_year, headquarters, phone, email,
          social_linkedin, social_twitter, social_instagram, userId
        ]
      );
      company = result.rows[0];
      
      return NextResponse.json({
        success: true,
        message: 'Company updated successfully',
        data: company,
      });
      
    } else {
      // CREATE new company
      const result = await query(
        `INSERT INTO companies 
         (user_id, name, description, website, logo_url, cover_image_url,
          industry, size, founded_year, headquarters, phone, email,
          social_linkedin, social_twitter, social_instagram, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         RETURNING *`,
        [
          userId, name, description, website, logo_url, cover_image_url,
          industry, size, founded_year, headquarters, phone, email,
          social_linkedin, social_twitter, social_instagram, false
        ]
      );
      company = result.rows[0];
      
      return NextResponse.json({
        success: true,
        message: 'Company created successfully',
        data: company,
      }, { status: 201 });
    }
    
  } catch (error) {
    console.error('Save company error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}