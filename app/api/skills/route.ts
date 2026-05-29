import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    // STEP 1: Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    // STEP 2: Verify user is authenticated (optional - skills can be public)
    // But we'll still check to know if we need to show user's selected skills
    const token = request.cookies.get('auth_token')?.value;
    let userId = null;
    
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        userId = payload.userId;
      }
    }
    
    // STEP 3: Build the query based on filters
    let sql = `
      SELECT id, name, category, icon 
      FROM skills 
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (category) {
      sql += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    if (search) {
      sql += ` AND name ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    sql += ` ORDER BY name ASC`;
    
    // STEP 4: Execute query
    const result = await query(sql, params);
    
    // STEP 5: Get unique categories for filtering
    const categoriesResult = await query(
      `SELECT DISTINCT category FROM skills WHERE category IS NOT NULL ORDER BY category`
    );
    const categories = categoriesResult.rows.map(row => row.category);
    
    // STEP 6: If user is logged in and is a candidate, get their selected skills
    let userSkills: number[] = [];
    if (userId) {
      // Check user role first
      const userResult = await query(
        `SELECT role FROM users WHERE id = $1`,
        [userId]
      );
      
      if (userResult.rows[0]?.role === 'candidate') {
        const userSkillsResult = await query(
          `SELECT skill_id FROM candidate_skills WHERE candidate_id = $1`,
          [userId]
        );
        userSkills = userSkillsResult.rows.map(row => row.skill_id);
      }
    }
    
    // STEP 7: Return skills data
    return NextResponse.json({
      success: true,
      data: {
        skills: result.rows,
        categories: categories,
        user_skills: userSkills, // Empty array if not candidate
      },
    });
    
  } catch (error) {
    console.error('Get skills error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}