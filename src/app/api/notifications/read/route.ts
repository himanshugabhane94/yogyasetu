import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/notifications/read
 * Mark notifications as read for current user
 * Body: { notificationId?: string, markAll?: boolean }
 */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { notificationId, markAll } = body;

    if (notificationId) {
      await prisma.notification.updateMany({
        where: { id: notificationId, userId },
        data: { read: true, isRead: true },
      });
      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    }

    // Default to mark all for current user
    await prisma.notification.updateMany({
      where: { userId, AND: [{ read: false }, { isRead: false }] },
      data: { read: true, isRead: true },
    });

    return NextResponse.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('Mark notification read error:', error);
    return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return PATCH(request);
}
