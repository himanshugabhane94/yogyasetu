import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendDeadlineReminderEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reminders
 * Returns upcoming deadline schemes for the logged-in user (within 30 days)
 * and automatically logs database notifications / emails for 7, 3, 1 day thresholds.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ deadlines: [] });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ deadlines: [] });
    }

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Fetch user's bookmarked schemes that have an upcoming closeDate within 30 days
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId,
        scheme: {
          closeDate: {
            gte: now,
            lte: thirtyDaysFromNow,
          },
        },
      },
      include: {
        scheme: {
          include: {
            category: true,
          },
        },
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    const upcomingDeadlines = [];

    for (const bm of bookmarks) {
      const scheme = bm.scheme;
      if (!scheme.closeDate) continue;

      const diffMs = new Date(scheme.closeDate).getTime() - now.getTime();
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const formattedDate = new Date(scheme.closeDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      upcomingDeadlines.push({
        id: scheme.id,
        titleEn: scheme.titleEn,
        titleHi: scheme.titleHi,
        departmentEn: scheme.departmentEn,
        departmentHi: scheme.departmentHi,
        closeDate: scheme.closeDate,
        closeDateFormatted: formattedDate,
        daysLeft,
        officialLink: scheme.officialLink,
        category: scheme.category,
      });

      // Trigger automated notification for 7, 3, and 1 day milestones if not sent today
      if (daysLeft === 7 || daysLeft === 3 || daysLeft === 1) {
        const notifTitle = `Deadline Alert: ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left for ${scheme.titleEn}`;
        
        // Check if notification already logged today
        const existingNotif = await prisma.notification.findFirst({
          where: {
            userId,
            titleEn: notifTitle,
          },
        });

        if (!existingNotif) {
          await prisma.notification.create({
            data: {
              userId,
              type: 'DEADLINE',
              titleEn: notifTitle,
              titleHi: `अंतिम तिथि चेतावनी: ${scheme.titleHi} के लिए ${daysLeft} दिन शेष`,
              messageEn: `The application deadline for ${scheme.titleEn} closes on ${formattedDate}. Complete your submission before the portal closes.`,
              messageHi: `${scheme.titleHi} के लिए आवेदन करने की अंतिम तिथि ${formattedDate} है। कृपया समय से पहले आवेदन करें।`,
              link: `/schemes/${scheme.id}`,
            },
          });

          // Dispatch email if user has a valid email address
          if (user?.email && user.email.includes('@')) {
            await sendDeadlineReminderEmail(
              user.email,
              user.name,
              scheme.titleEn,
              scheme.departmentEn,
              daysLeft,
              formattedDate,
              scheme.officialLink,
              scheme.id
            );
          }
        }
      }
    }

    // Sort by soonest deadline first
    upcomingDeadlines.sort((a, b) => a.daysLeft - b.daysLeft);

    return NextResponse.json({
      deadlines: upcomingDeadlines,
      count: upcomingDeadlines.length,
    });
  } catch (error: any) {
    console.error('Fetch reminders error:', error);
    return NextResponse.json({ error: 'Failed to fetch deadline reminders' }, { status: 500 });
  }
}
