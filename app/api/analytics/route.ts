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
    if (!payload || payload.role !== 'recruiter') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }
    
    const userId = payload.userId;
    
    // Step 2: Get recruiter's company
    const companyResult = await query(
      'SELECT id, name FROM companies WHERE user_id = $1',
      [userId]
    );
    
    if (companyResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          has_company: false,
          message: 'Create a company profile to see analytics',
        },
      });
    }
    
    const companyId = companyResult.rows[0].id;
    const companyName = companyResult.rows[0].name;
    
    // Step 3: Get job statistics
    const jobStats = await query(
      `SELECT 
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_jobs,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_jobs,
        SUM(views_count) as total_views,
        SUM(applications_count) as total_applications
       FROM jobs 
       WHERE company_id = $1`,
      [companyId]
    );
    
    // Step 4: Get application funnel data
    const funnelData = await query(
      `SELECT 
        COUNT(*) as total_applications,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'reviewed' THEN 1 END) as reviewed,
        COUNT(CASE WHEN status = 'shortlisted' THEN 1 END) as shortlisted,
        COUNT(CASE WHEN status = 'interview' THEN 1 END) as interview,
        COUNT(CASE WHEN status = 'hired' THEN 1 END) as hired,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE j.company_id = $1`,
      [companyId]
    );
    
    // Step 5: Get jobs with their performance
    const jobsPerformance = await query(
      `SELECT 
        j.id,
        j.title,
        j.status,
        j.posted_date,
        j.views_count,
        j.applications_count,
        ROUND((j.applications_count::DECIMAL / NULLIF(j.views_count, 0)) * 100, 1) as conversion_rate
       FROM jobs j
       WHERE j.company_id = $1
       ORDER BY j.posted_date DESC
       LIMIT 10`,
      [companyId]
    );
    
    // Step 6: Get monthly trends (last 6 months)
    const monthlyTrends = await query(
      `SELECT 
        DATE_TRUNC('month', j.posted_date) as month,
        COUNT(DISTINCT j.id) as jobs_posted,
        SUM(j.views_count) as total_views,
        SUM(j.applications_count) as total_applications
       FROM jobs j
       WHERE j.company_id = $1 
         AND j.posted_date >= NOW() - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('month', j.posted_date)
       ORDER BY month DESC`,
      [companyId]
    );
    
    // Step 7: Get top skills from applicants (for insights)
    const topSkills = await query(
      `SELECT 
        s.name,
        COUNT(*) as count
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN candidate_skills cs ON a.candidate_id = cs.candidate_id
       JOIN skills s ON cs.skill_id = s.id
       WHERE j.company_id = $1
       GROUP BY s.name
       ORDER BY count DESC
       LIMIT 10`,
      [companyId]
    );
    
    // Step 8: Calculate conversion metrics
    const funnel = funnelData.rows[0];
    const conversionRates = {
      application_to_review: funnel.total_applications > 0 
        ? Math.round((funnel.reviewed / funnel.total_applications) * 100) 
        : 0,
      review_to_shortlist: funnel.reviewed > 0 
        ? Math.round((funnel.shortlisted / funnel.reviewed) * 100) 
        : 0,
      shortlist_to_interview: funnel.shortlisted > 0 
        ? Math.round((funnel.interview / funnel.shortlisted) * 100) 
        : 0,
      interview_to_hire: funnel.interview > 0 
        ? Math.round((funnel.hired / funnel.interview) * 100) 
        : 0,
      overall_hire_rate: funnel.total_applications > 0 
        ? Math.round((funnel.hired / funnel.total_applications) * 100) 
        : 0,
    };
    
    // Step 9: Return complete analytics
    return NextResponse.json({
      success: true,
      data: {
        company: {
          id: companyId,
          name: companyName,
        },
        overview: {
          total_jobs: parseInt(jobStats.rows[0]?.total_jobs || '0'),
          active_jobs: parseInt(jobStats.rows[0]?.active_jobs || '0'),
          closed_jobs: parseInt(jobStats.rows[0]?.closed_jobs || '0'),
          total_views: parseInt(jobStats.rows[0]?.total_views || '0'),
          total_applications: parseInt(jobStats.rows[0]?.total_applications || '0'),
        },
        funnel: {
          total: parseInt(funnel.total_applications || '0'),
          pending: parseInt(funnel.pending || '0'),
          reviewed: parseInt(funnel.reviewed || '0'),
          shortlisted: parseInt(funnel.shortlisted || '0'),
          interview: parseInt(funnel.interview || '0'),
          hired: parseInt(funnel.hired || '0'),
          rejected: parseInt(funnel.rejected || '0'),
        },
        conversion_rates: conversionRates,
        jobs_performance: jobsPerformance.rows,
        monthly_trends: monthlyTrends.rows,
        top_skills: topSkills.rows,
      },
    });
    
  } catch (error) {
    console.error('Recruiter analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}