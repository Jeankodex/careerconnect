import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { query, transaction } from '@/lib/db/postgres';

// GET - Get single job details (public)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = parseInt(params.id);
    
    if (isNaN(jobId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid job ID' },
        { status: 400 }
      );
    }
    
    // Check if user is logged in
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
    
    // Fetch job details
    const result = await query(
      `SELECT 
        j.*,
        c.id as company_id,
        c.name as company_name,
        c.logo_url as company_logo,
        c.description as company_description,
        c.industry as company_industry,
        c.headquarters as company_location
       FROM jobs j
       JOIN companies c ON j.company_id = c.id
       WHERE j.id = $1`,
      [jobId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Job not found' },
        { status: 404 }
      );
    }
    
    const job = result.rows[0];
    
    // Increment view count
    await query(
      'UPDATE jobs SET views_count = views_count + 1 WHERE id = $1',
      [jobId]
    );
    
    // Get skills for this job
    const skillsResult = await query(
      `SELECT s.id, s.name, s.category, js.is_required
       FROM job_skills js
       JOIN skills s ON js.skill_id = s.id
       WHERE js.job_id = $1`,
      [jobId]
    );
    job.skills = skillsResult.rows;
    
    // Check if user has applied
    let hasApplied = false;
    if (userId && userRole === 'candidate') {
      const appliedResult = await query(
        'SELECT id FROM applications WHERE job_id = $1 AND candidate_id = $2',
        [jobId, userId]
      );
      hasApplied = appliedResult.rows.length > 0;
    }
    
    // Check if user owns this job (for edit/delete permissions)
    let isOwner = false;
    if (userId && userRole === 'recruiter') {
      isOwner = job.recruiter_id === userId;
    }
    
    return NextResponse.json({
      success: true,
      data: {
        job,
        has_applied: hasApplied,
        is_owner: isOwner,
      },
    });
    
  } catch (error) {
    console.error('Get job error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update job (Recruiter only, must be owner)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = parseInt(params.id);
    
    // Verify authentication
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
    
    // Verify ownership
    const ownershipCheck = await query(
      'SELECT recruiter_id FROM jobs WHERE id = $1',
      [jobId]
    );
    
    if (ownershipCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Job not found' },
        { status: 404 }
      );
    }
    
    if (ownershipCheck.rows[0].recruiter_id !== payload.userId) {
      return NextResponse.json(
        { success: false, message: 'You can only edit your own jobs' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const {
      title,
      description,
      requirements,
      responsibilities,
      benefits,
      location,
      is_remote,
      salary_min,
      salary_max,
      salary_currency,
      job_type,
      work_type,
      experience_level,
      closing_date,
      status,
    } = body;
    
    // Update job
    const result = await query(
      `UPDATE jobs 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           requirements = COALESCE($3, requirements),
           responsibilities = COALESCE($4, responsibilities),
           benefits = COALESCE($5, benefits),
           location = COALESCE($6, location),
           is_remote = COALESCE($7, is_remote),
           salary_min = COALESCE($8, salary_min),
           salary_max = COALESCE($9, salary_max),
           salary_currency = COALESCE($10, salary_currency),
           job_type = COALESCE($11, job_type),
           work_type = COALESCE($12, work_type),
           experience_level = COALESCE($13, experience_level),
           closing_date = COALESCE($14, closing_date),
           status = COALESCE($15, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $16
       RETURNING *`,
      [
        title, description, requirements, responsibilities, benefits,
        location, is_remote, salary_min, salary_max, salary_currency,
        job_type, work_type, experience_level, closing_date, status, jobId
      ]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Job updated successfully',
      data: result.rows[0],
    });
    
  } catch (error) {
    console.error('Update job error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete job (Recruiter only, must be owner)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = parseInt(params.id);
    
    // Verify authentication
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
    
    // Verify ownership
    const ownershipCheck = await query(
      'SELECT recruiter_id, status FROM jobs WHERE id = $1',
      [jobId]
    );
    
    if (ownershipCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Job not found' },
        { status: 404 }
      );
    }
    
    if (ownershipCheck.rows[0].recruiter_id !== payload.userId) {
      return NextResponse.json(
        { success: false, message: 'You can only delete your own jobs' },
        { status: 403 }
      );
    }
    
    // Soft delete - set status to 'closed' instead of actual deletion
    await query(
      `UPDATE jobs 
       SET status = 'closed', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [jobId]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Job closed successfully',
    });
    
  } catch (error) {
    console.error('Delete job error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}