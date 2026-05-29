import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    // STEP 1: Verify user is authenticated
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
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    const userId = payload.userId;
    
    // STEP 2: Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const onlyUnread = searchParams.get('unread') === 'true';
    
    // STEP 3: Build query
    let sql = `
      SELECT 
        id, 
        title, 
        message, 
        type, 
        is_read, 
        related_entity_type,
        related_entity_id,
        metadata,
        created_at
      FROM notifications 
      WHERE user_id = $1
    `;
    const params: any[] = [userId];
    let paramIndex = 2;
    
    if (onlyUnread) {
      sql += ` AND is_read = false`;
    }
    
    sql += ` ORDER BY is_read ASC, created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    // STEP 4: Execute query
    const result = await query(sql, params);
    
    // STEP 5: Get unread count for badge
    const unreadResult = await query(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    const unreadCount = parseInt(unreadResult.rows[0]?.count || '0');
    
    // STEP 6: Get total count for pagination
    const totalResult = await query(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1`,
      [userId]
    );
    const total = parseInt(totalResult.rows[0]?.count || '0');
    
    // STEP 7: Return response
    return NextResponse.json({
      success: true,
      data: {
        notifications: result.rows,
        unread_count: unreadCount,
        pagination: {
          total,
          limit,
          offset,
          has_more: offset + result.rows.length < total,
        },
      },
    });
    
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Mark notification as read
export async function PUT(request: NextRequest) {
  try {
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
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { notification_id, mark_all } = body;
    
    if (mark_all) {
      // Mark all notifications as read
      await query(
        `UPDATE notifications SET is_read = true, read_at = CURRENT_TIMESTAMP 
         WHERE user_id = $1 AND is_read = false`,
        [payload.userId]
      );
    } else if (notification_id) {
      // Mark single notification as read
      await query(
        `UPDATE notifications SET is_read = true, read_at = CURRENT_TIMESTAMP 
         WHERE id = $1 AND user_id = $2`,
        [notification_id, payload.userId]
      );
    } else {
      return NextResponse.json(
        { success: false, message: 'Either notification_id or mark_all is required' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Notifications updated',
    });
    
  } catch (error) {
    console.error('Update notifications error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}