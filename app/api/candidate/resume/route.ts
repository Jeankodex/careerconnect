
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { query } from '@/lib/db/postgres';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
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
    
    // Step 2: Get the uploaded file
    const formData = await request.formData();
    const file = formData.get('resume') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // Step 3: Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Please upload PDF, DOC, or DOCX.' },
        { status: 400 }
      );
    }
    
    // Step 4: Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }
    
    // Step 5: Generate unique filename
    const timestamp = Date.now();
    const safeFileName = `${payload.userId}_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Step 6: Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
    await mkdir(uploadDir, { recursive: true });
    
    // Step 7: Save file to disk
    const filePath = path.join(uploadDir, safeFileName);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, fileBuffer);
    
    // Step 8: Generate public URL
    const fileUrl = `/uploads/resumes/${safeFileName}`;
    
    // Step 9: Update database with resume URL
    await query(
      `UPDATE candidate_profiles 
       SET resume_url = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [fileUrl, payload.userId]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resume_url: fileUrl,
        file_name: file.name,
        file_size: file.size,
      },
    });
    
  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Delete resume
export async function DELETE(request: NextRequest) {
  try {
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
    
    // Get current resume URL
    const profileResult = await query(
      'SELECT resume_url FROM candidate_profiles WHERE user_id = $1',
      [payload.userId]
    );
    
    const currentResumeUrl = profileResult.rows[0]?.resume_url;
    
    if (currentResumeUrl) {
      // Delete file from disk (optional - implement if needed)
      // For now, just remove from database
      await query(
        `UPDATE candidate_profiles SET resume_url = NULL, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1`,
        [payload.userId]
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Resume removed successfully',
    });
    
  } catch (error) {
    console.error('Resume delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}