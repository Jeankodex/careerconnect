import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { query } from '@/lib/db/postgres';

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
    
    // Step 1: Check if user is logged in
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
    
    // Step 2: Fetch job details
    let sql = `
      SELECT 
        j.id,
        j.title,
        j.description,
        j.requirements,
        j.responsibilities,
        j.benefits,
        j.location,
        j.is_remote,
        j.salary_min,
        j.salary_max,
        j.salary_currency,
        j.job_type,
        j.work_type,
        j.experience_level,
        j.status,
        j.posted_date,
        j.closing_date,
        j.views_count,
        j.applications_count,
        c.id as company_id,
        c.name as company_name,
        c.description as company_description,
        c.logo_url as company_logo,
        c.cover_image_url as company_cover,
        c.industry as company_industry,
        c.size as company_size,
        c.headquarters as company_location,
        c.website as company_website,
        c.social_linkedin as company_linkedin,
        c.social_twitter as company_twitter,
        c.is_verified as company_verified
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE j.id = $1
    `;
    
    const result = await query(sql, [jobId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Job not found' },
        { status: 404 }
      );
    }
    
    const job = result.rows[0];
    
    // Step 3: Increment view count
    await query(
      'UPDATE jobs SET views_count = views_count + 1 WHERE id = $1',
      [jobId]
    );
    job.views_count += 1;
    
    // Step 4: Fetch required skills for this job
    const skillsResult = await query(
      `SELECT s.id, s.name, s.category, js.is_required
       FROM job_skills js
       JOIN skills s ON js.skill_id = s.id
       WHERE js.job_id = $1
       ORDER BY js.is_required DESC, s.name`,
      [jobId]
    );
    job.skills = skillsResult.rows;
    
    // Step 5: Check if candidate has already applied
    let hasApplied = false;
    let applicationStatus = null;
    
    if (userId && userRole === 'candidate') {
      const applicationResult = await query(
        `SELECT id, status, applied_date 
         FROM applications 
         WHERE job_id = $1 AND candidate_id = $2`,
        [jobId, userId]
      );
      
      if (applicationResult.rows.length > 0) {
        hasApplied = true;
        applicationStatus = applicationResult.rows[0].status;
      }
    }
    
    // Step 6: Get similar jobs (same company or same skills)
    const similarJobsResult = await query(
      `SELECT 
        j.id, j.title, j.location, j.job_type, j.salary_min, j.salary_max,
        c.name as company_name, c.logo_url as company_logo
       FROM jobs j
       JOIN companies c ON j.company_id = c.id
       WHERE j.status = 'active' 
         AND j.id != $1
         AND (j.company_id = $2 OR EXISTS (
           SELECT 1 FROM job_skills js 
           WHERE js.job_id = j.id AND js.skill_id IN (
             SELECT skill_id FROM job_skills WHERE job_id = $1
           )
         ))
       LIMIT 5`,
      [jobId, job.company_id]
    );
    job.similar_jobs = similarJobsResult.rows;
    
    // Step 7: Return response
    return NextResponse.json({
      success: true,
      data: {
        job,
        has_applied: hasApplied,
        application_status: applicationStatus,
      },
    });
    
  } catch (error) {
    console.error('Get job details error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}