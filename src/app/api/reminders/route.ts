import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reminders
 * Fetch active deadline reminders for the authenticated user
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const schemeId = searchParams.get('schemeId')?.trim();

    const whereClause: any = {
      userId,
      status: { not: 'CANCELLED' },
    };

    if (schemeId) {
      whereClause.schemeId = schemeId;
    }

    const reminders = await prisma.reminder.findMany({
      where: whereClause,
      include: {
        scheme: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    const formattedReminders = reminders.map((r) => {
      const scheme = r.scheme;
      const targetDate = scheme.deadline || scheme.closeDate;
      let daysLeft: number | null = null;
      let formattedDate: string | null = null;
      let isPast = false;

      if (r.remindOn) {
        const rd = new Date(r.remindOn);
        const diffMs = rd.getTime() - now.getTime();
        daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        isPast = daysLeft < 0;
        formattedDate = rd.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      } else if (targetDate) {
        const d = new Date(targetDate);
        const diffMs = d.getTime() - now.getTime();
        daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        formattedDate = d.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        isPast = daysLeft < 0;
      }

      return {
        id: r.id,
        schemeId: r.schemeId,
        daysBefore: r.daysBefore,
        remindOn: r.remindOn,
        remindOnFormatted: r.remindOn
          ? new Date(r.remindOn).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : null,
        channelEmail: r.channelEmail,
        channelInApp: r.channelInApp,
        lastSentAt: r.lastSentAt,
        status: r.status,
        createdAt: r.createdAt,
        daysLeft,
        isPast,
        deadlineFormatted: formattedDate,
        scheme: {
          id: scheme.id,
          titleEn: scheme.titleEn,
          titleHi: scheme.titleHi,
          departmentEn: scheme.departmentEn,
          departmentHi: scheme.departmentHi,
          deadline: scheme.deadline,
          closeDate: scheme.closeDate,
          deadlineNote: scheme.deadlineNote,
          deadlineVerifiedAt: scheme.deadlineVerifiedAt || scheme.lastVerified,
          officialLink: scheme.officialLink,
          state: scheme.state,
          level: scheme.level,
          category: scheme.category,
        },
      };
    });

    return NextResponse.json({
      reminders: formattedReminders,
      count: formattedReminders.length,
    });
  } catch (error: any) {
    console.error('Fetch reminders error:', error);
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 });
  }
}

/**
 * POST /api/reminders
 * Create or update deadline reminders for a scheme
 * Body: { schemeId: string, daysBefore?: number | number[], remindOn?: string, channelEmail?: boolean, channelInApp?: boolean, replaceAllForScheme?: boolean }
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      schemeId,
      daysBefore,
      remindOn,
      channelEmail = true,
      channelInApp = true,
      replaceAllForScheme = false,
    } = body;

    if (!schemeId) {
      return NextResponse.json({ error: 'schemeId is required' }, { status: 400 });
    }

    // Verify scheme exists
    const scheme = await prisma.scheme.findUnique({
      where: { id: schemeId },
      select: { id: true, deadline: true, closeDate: true, deadlineNote: true },
    });

    if (!scheme) {
      return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });
    }

    // Case 1: Custom date reminder (for ongoing schemes or specific user date)
    if (remindOn) {
      const parsedRemindOn = new Date(remindOn);
      if (isNaN(parsedRemindOn.getTime())) {
        return NextResponse.json({ error: 'Invalid remindOn date' }, { status: 400 });
      }

      if (replaceAllForScheme) {
        await prisma.reminder.deleteMany({
          where: {
            userId,
            schemeId,
            daysBefore: { notIn: [0] },
          },
        });
      }

      const reminder = await prisma.reminder.upsert({
        where: {
          userId_schemeId_daysBefore: {
            userId,
            schemeId,
            daysBefore: 0,
          },
        },
        create: {
          userId,
          schemeId,
          daysBefore: 0,
          remindOn: parsedRemindOn,
          channelEmail: Boolean(channelEmail),
          channelInApp: Boolean(channelInApp),
          status: 'ACTIVE',
        },
        update: {
          remindOn: parsedRemindOn,
          channelEmail: Boolean(channelEmail),
          channelInApp: Boolean(channelInApp),
          status: 'ACTIVE',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Reminder configured successfully',
        reminders: [reminder],
      });
    }

    // Case 2: Deadline-based milestone reminders (7, 3, 1 days)
    const daysList: number[] = Array.isArray(daysBefore)
      ? daysBefore.map((d: any) => parseInt(d, 10)).filter((d: number) => !isNaN(d) && d > 0)
      : typeof daysBefore === 'number' && daysBefore > 0
      ? [daysBefore]
      : [7, 3, 1]; // default 7, 3, 1 days

    // If replaceAllForScheme is true, delete existing active reminders for milestones not in daysList (and custom reminders)
    if (replaceAllForScheme) {
      await prisma.reminder.deleteMany({
        where: {
          userId,
          schemeId,
          daysBefore: { notIn: daysList },
        },
      });
    }

    const savedReminders = [];

    for (const days of daysList) {
      const reminder = await prisma.reminder.upsert({
        where: {
          userId_schemeId_daysBefore: {
            userId,
            schemeId,
            daysBefore: days,
          },
        },
        create: {
          userId,
          schemeId,
          daysBefore: days,
          remindOn: null,
          channelEmail: Boolean(channelEmail),
          channelInApp: Boolean(channelInApp),
          status: 'ACTIVE',
        },
        update: {
          remindOn: null,
          channelEmail: Boolean(channelEmail),
          channelInApp: Boolean(channelInApp),
          status: 'ACTIVE',
        },
      });
      savedReminders.push(reminder);
    }

    return NextResponse.json({
      success: true,
      message: 'Reminders configured successfully',
      reminders: savedReminders,
    });
  } catch (error: any) {
    console.error('Create reminder error:', error);
    return NextResponse.json({ error: 'Failed to configure reminder' }, { status: 500 });
  }
}

/**
 * DELETE /api/reminders
 * Delete a specific reminder or all reminders for a scheme
 * Query param: ?id=... or ?schemeId=...
 */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const schemeId = searchParams.get('schemeId');

    if (id) {
      const existing = await prisma.reminder.findUnique({
        where: { id },
      });

      if (!existing || existing.userId !== userId) {
        return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
      }

      await prisma.reminder.delete({
        where: { id },
      });

      return NextResponse.json({ success: true, message: 'Reminder deleted' });
    }

    if (schemeId) {
      await prisma.reminder.deleteMany({
        where: {
          userId,
          schemeId,
        },
      });

      return NextResponse.json({ success: true, message: 'All reminders for scheme deleted' });
    }

    return NextResponse.json({ error: 'id or schemeId required' }, { status: 400 });
  } catch (error: any) {
    console.error('Delete reminder error:', error);
    return NextResponse.json({ error: 'Failed to delete reminder' }, { status: 500 });
  }
}
