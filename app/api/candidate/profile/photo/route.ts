import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { query } from '@/lib/db/postgres';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'candidate') {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('profile_picture') as File;

    if (!file || typeof file.name !== 'string') {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, message: 'Only JPG, PNG, WebP, and GIF are allowed.' }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, message: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    const timestamp = Date.now();
    const safeFileName = `${payload.userId}_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profile-pics');
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, safeFileName);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, fileBuffer);

    const fileUrl = `/uploads/profile-pics/${safeFileName}`;

    const existingProfile = await query('SELECT id FROM candidate_profiles WHERE user_id = $1', [payload.userId]);
    if (existingProfile.rows.length > 0) {
      await query(
        'UPDATE candidate_profiles SET profile_picture = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
        [fileUrl, payload.userId]
      );
    } else {
      await query(
        'INSERT INTO candidate_profiles (user_id, first_name, last_name, profile_picture) VALUES ($1, $2, $3, $4)',
        [payload.userId, '', '', fileUrl]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: { profile_picture: fileUrl },
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
