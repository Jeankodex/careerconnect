import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { query } from '@/lib/db/postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = parseInt(params.id);
    
    if (isNaN(applicationId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid application ID' },
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
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Step 2: Fetch application details
    const result = await query(
      `SELECT 
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
        j.id as job_id,
        j.title as job_title,
        j.description as job_description,
        j.location as job_location,
        j.job_type,
        j.salary_min,
        j.salary_max,
        c.id as company_id,
        c.name as company_name,
        c.logo_url as company_logo,
        c.website as company_website,
        c.headquarters as company_location
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      WHERE a.id = $1`,
      [applicationId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }
    
    const application = result.rows[0];
    
    // Step 3: Verify ownership
    if (payload.role === 'candidate') {
      const ownershipCheck = await query(
        'SELECT candidate_id FROM applications WHERE id = $1',
        [applicationId]
      );
      
      if (ownershipCheck.rows[0]?.candidate_id !== payload.userId) {
        return NextResponse.json(
          { success: false, message: 'Access denied' },
          { status: 403 }
        );
      }
    }
    
    // Step 4: Generate status timeline
    const timeline = [
      {
        status: 'pending',
        title: 'Application Submitted',
        description: 'Your application has been received',
        date: application.applied_date,
        completed: true,
      },
      {
        status: 'reviewed',
        title: 'Application Reviewed',
        description: 'Recruiter has reviewed your application',
        date: application.reviewed_at,
        completed: application.status !== 'pending' && application.reviewed_at !== null,
      },
      {
        status: 'shortlisted',
        title: 'Shortlisted',
        description: 'You have been shortlisted for the position',
        date: null,
        completed: ['shortlisted', 'hired'].includes(application.status),
      },
      {
        status: 'interview',
        title: 'Interview Scheduled',
        description: application.interview_date 
          ? `Interview scheduled for ${new Date(application.interview_date).toLocaleDateString()}`
          : 'Awaiting interview scheduling',
        date: application.interview_date,
        completed: application.interview_date !== null && application.status !== 'rejected',
      },
      {
        status: 'hired',
        title: 'Offer Extended',
        description: 'Congratulations! You have been selected',
        date: null,
        completed: application.status === 'hired',
      },
    ];
    
    // Step 5: Return response
    return NextResponse.json({
      success: true,
      data: {
        application,
        timeline,
        can_withdraw: application.status === 'pending',
      },
    });
    
  } catch (error) {
    console.error('Get application details error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}