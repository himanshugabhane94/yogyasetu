import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/notifications
 * Fetch user's latest notifications and unread count
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!session || !userId) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50);

    const rawNotifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        AND: [
          { read: false },
          { isRead: false },
        ],
      },
    });

    const notifications = rawNotifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      type: n.type,
      titleEn: n.title_en || n.titleEn,
      titleHi: n.title_hi || n.titleHi,
      messageEn: n.body_en || n.messageEn,
      messageHi: n.body_hi || n.messageHi,
      title_en: n.title_en || n.titleEn,
      title_hi: n.title_hi || n.titleHi,
      body_en: n.body_en || n.messageEn,
      body_hi: n.body_hi || n.messageHi,
      link: n.link,
      read: n.isRead || n.read,
      isRead: n.isRead || n.read,
      createdAt: n.createdAt,
    }));

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

/**
 * PATCH /api/notifications
 * Mark one or all notifications as read
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

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId },
        data: { read: true, isRead: true },
      });
      return NextResponse.json({ message: 'All notifications marked as read', success: true });
    }

    if (notificationId) {
      await prisma.notification.updateMany({
        where: { id: notificationId, userId },
        data: { read: true, isRead: true },
      });
      return NextResponse.json({ message: 'Notification marked as read', success: true });
    }

    // Default to marking all as read if no specific id given
    await prisma.notification.updateMany({
      where: { userId },
      data: { read: true, isRead: true },
    });

    return NextResponse.json({ message: 'Notifications marked as read', success: true });
  } catch (error: any) {
    console.error('Update notification error:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
