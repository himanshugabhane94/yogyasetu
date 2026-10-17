import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendDeadlineReminderEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

function getIstDateString(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date); // YYYY-MM-DD
}

function formatIstDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}

async function handleCron(request: Request) {
  try {
    // 1. Authorization check: Bearer <CRON_SECRET>
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const todayIst = getIstDateString(now);

    // 2. Fetch all ACTIVE reminders with scheme and user details
    const activeReminders = await prisma.reminder.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        scheme: {
          select: {
            id: true,
            titleEn: true,
            titleHi: true,
            departmentEn: true,
            departmentHi: true,
            deadline: true,
            closeDate: true,
            deadlineNote: true,
            officialLink: true,
          },
        },
      },
    });

    let processedCount = 0;
    let sentCount = 0;
    let expiredCount = 0;
    let errorCount = 0;

    for (const reminder of activeReminders) {
      processedCount++;
      const targetDeadline = reminder.scheme.deadline || reminder.scheme.closeDate;

      // If scheme has no date-based deadline, skip
      if (!targetDeadline) {
        continue;
      }

      const deadlineDate = new Date(targetDeadline);

      // Check if deadline has already passed
      if (deadlineDate.getTime() < now.getTime() || getIstDateString(deadlineDate) < todayIst) {
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { status: 'SENT' },
        });
        expiredCount++;
        continue;
      }

      // Calculate the trigger date in IST (deadline - daysBefore days)
      const triggerDate = new Date(deadlineDate.getTime() - reminder.daysBefore * 24 * 60 * 60 * 1000);
      const triggerDateIst = getIstDateString(triggerDate);

      // Trigger condition: today in IST matches trigger date
      if (triggerDateIst === todayIst) {
        // Idempotency check: has this reminder already been sent today?
        if (reminder.lastSentAt) {
          const lastSentIst = getIstDateString(new Date(reminder.lastSentAt));
          if (lastSentIst === todayIst) {
            // Already sent today; skip to prevent duplicate notifications
            continue;
          }
        }

        const daysLeft = Math.max(0, Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const formattedDeadline = formatIstDisplayDate(deadlineDate);

        // 1. In-App Notification
        if (reminder.channelInApp) {
          try {
            const notifTitleEn = `Deadline Alert: ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left for ${reminder.scheme.titleEn}`;
            const notifTitleHi = `अंतिम तिथि चेतावनी: ${reminder.scheme.titleHi} के लिए ${daysLeft} दिन शेष`;
            const notifMsgEn = `The application deadline for ${reminder.scheme.titleEn} is on ${formattedDeadline}. Complete your application before the official portal closes. Verify the deadline on the official website.`;
            const notifMsgHi = `${reminder.scheme.titleHi} के लिए आवेदन करने की अंतिम तिथि ${formattedDeadline} है। पोर्टल बंद होने से पहले आवेदन पूरा करें। आधिकारिक वेबसाइट पर अंतिम तिथि सत्यापित करें।`;

            await prisma.notification.create({
              data: {
                userId: reminder.userId,
                type: 'DEADLINE',
                titleEn: notifTitleEn,
                titleHi: notifTitleHi,
                title_en: notifTitleEn,
                title_hi: notifTitleHi,
                messageEn: notifMsgEn,
                messageHi: notifMsgHi,
                body_en: notifMsgEn,
                body_hi: notifMsgHi,
                link: `/schemes/${reminder.scheme.id}`,
                read: false,
                isRead: false,
              },
            });
          } catch (notifErr) {
            console.error(`Failed to create in-app notification for reminder ${reminder.id}:`, notifErr);
          }
        }

        // 2. Email Notification (via existing Nodemailer mailer)
        if (reminder.channelEmail && reminder.user?.email && reminder.user.email.includes('@')) {
          try {
            await sendDeadlineReminderEmail(
              reminder.user.email,
              reminder.user.name,
              reminder.scheme.titleEn,
              reminder.scheme.departmentEn,
              daysLeft,
              formattedDeadline,
              reminder.scheme.officialLink || 'https://myscheme.gov.in',
              reminder.scheme.id
            );
          } catch (mailErr) {
            errorCount++;
            console.error(`Failed to send email to ${reminder.user.email} for reminder ${reminder.id}:`, mailErr);
            // One failing email must NOT stop the loop
          }
        }

        // 3. Mark lastSentAt to today to guarantee idempotency
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { lastSentAt: now },
        });

        sentCount++;
      }
    }

    return NextResponse.json({
      success: true,
      todayIst,
      processed: processedCount,
      sentToday: sentCount,
      expiredMarkedSent: expiredCount,
      emailErrors: errorCount,
    });
  } catch (error: any) {
    console.error('Cron reminders runner error:', error);
    return NextResponse.json({ error: 'Internal cron execution failure', details: error.message }, { status: 500 });
  }
}
