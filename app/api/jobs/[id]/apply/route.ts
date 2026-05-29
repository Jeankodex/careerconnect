import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { query, transaction } from '@/lib/db/postgres';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(
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
    
    // Step 1: Verify authentication
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Please login to apply' },
        { status: 401 }
      );
    }
    
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'candidate') {
      return NextResponse.json(
        { success: false, message: 'Only candidates can apply' },
        { status: 403 }
      );
    }
    
    const candidateId = payload.userId;
    
    // Step 2: Get request body
    const body = await request.json();
    let { cover_letter, use_saved_resume } = body;
    
    // Step 3: Check if already applied
    const existingApplication = await query(
      'SELECT id FROM applications WHERE job_id = $1 AND candidate_id = $2',
      [jobId, candidateId]
    );
    
    if (existingApplication.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'You have already applied for this job' },
        { status: 409 }
      );
    }
    
    // Step 4: Check if job exists and is active
    const jobResult = await query(
      'SELECT id, title, company_id, recruiter_id, status, closing_date FROM jobs WHERE id = $1',
      [jobId]
    );
    
    if (jobResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Job not found' },
        { status: 404 }
      );
    }
    
    const job = jobResult.rows[0];
    
    if (job.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'This job is no longer accepting applications' },
        { status: 400 }
      );
    }
    
    if (job.closing_date && new Date(job.closing_date) < new Date()) {
      return NextResponse.json(
        { success: false, message: 'The application deadline has passed' },
        { status: 400 }
      );
    }
    
    // Step 5: Get resume URL
    let resumeUrl = null;
    
    if (use_saved_resume) {
      // Use saved resume from profile
      const profileResult = await query(
        'SELECT resume_url FROM candidate_profiles WHERE user_id = $1',
        [candidateId]
      );
      resumeUrl = profileResult.rows[0]?.resume_url;
      
      if (!resumeUrl) {
        return NextResponse.json(
          { success: false, message: 'No saved resume found. Please upload a resume.' },
          { status: 400 }
        );
      }
    } else {
      // Handle new resume upload
      const formData = await request.formData();
      const file = formData.get('resume') as File;
      
      if (!file) {
        return NextResponse.json(
          { success: false, message: 'Resume file is required' },
          { status: 400 }
        );
      }
      
      // Validate file
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, message: 'Invalid file type. Please upload PDF, DOC, or DOCX.' },
          { status: 400 }
        );
      }
      
      // Save file
      const timestamp = Date.now();
      const safeFileName = `${candidateId}_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'applications');
      await mkdir(uploadDir, { recursive: true });
      
      const filePath = path.join(uploadDir, safeFileName);
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, fileBuffer);
      
      resumeUrl = `/uploads/applications/${safeFileName}`;
    }
    
    // Step 6: Create application using transaction
    const application = await transaction(async (client) => {
      // Insert application
      const applicationResult = await client.query(
        `INSERT INTO applications (job_id, candidate_id, cover_letter, resume_url, status)
         VALUES ($1, $2, $3, $4, 'pending')
         RETURNING id, applied_date`,
        [jobId, candidateId, cover_letter || null, resumeUrl]
      );
      
      // Update job applications count
      await client.query(
        'UPDATE jobs SET applications_count = applications_count + 1 WHERE id = $1',
        [jobId]
      );
      
      // Create notification for recruiter
      await client.query(
        `INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          job.recruiter_id,
          'New Application Received',
          `A candidate has applied for "${job.title}"`,
          'application',
          'job',
          jobId,
          JSON.stringify({ application_id: applicationResult.rows[0].id, candidate_id: candidateId })
        ]
      );
      
      return applicationResult.rows[0];
    });
    
    // Step 7: Return response
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application_id: application.id,
        applied_date: application.applied_date,
        job_title: job.title,
      },
    });
    
  } catch (error) {
    console.error('Apply to job error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}