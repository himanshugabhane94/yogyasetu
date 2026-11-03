import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const scheme = await prisma.scheme.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
      },
    });

    if (!scheme) {
      return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });
    }

    // Increment views count asynchronously
    prisma.scheme.update({
      where: { id: scheme.id },
      data: { viewsCount: { increment: 1 } },
    }).catch((err) => console.error('Failed to increment views:', err));

    // Check if current user has bookmarked
    const session = await getServerSession(authOptions);
    let isBookmarked = false;
    let applicationStatus: string | null = null;

    if (session?.user) {
      const userId = (session.user as any).id;
      const [bookmark, app] = await Promise.all([
        prisma.bookmark.findUnique({
          where: {
            userId_schemeId: { userId, schemeId: scheme.id },
          },
        }),
        prisma.applicationTracker.findUnique({
          where: {
            userId_schemeId: { userId, schemeId: scheme.id },
          },
        }),
      ]);
      isBookmarked = Boolean(bookmark);
      if (app) applicationStatus = app.status;
    }

    return NextResponse.json({
      scheme: {
        ...scheme,
        isBookmarked,
        applicationStatus,
      },
    });
  } catch (error: any) {
    console.error('Get scheme details error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'VERIFIED_OFFICER'].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();

    const updated = await prisma.scheme.update({
      where: { id },
      data: {
        categoryId: body.categoryId,
        titleEn: body.titleEn,
        titleHi: body.titleHi,
        descriptionEn: body.descriptionEn,
        descriptionHi: body.descriptionHi,
        benefitsEn: body.benefitsEn,
        benefitsHi: body.benefitsHi,
        benefitType: body.benefitType,
        benefitAmount: body.benefitAmount,
        eligibilityJson: typeof body.eligibilityJson === 'string' ? body.eligibilityJson : JSON.stringify(body.eligibilityJson || {}),
        documentsRequired: typeof body.documentsRequired === 'string' ? body.documentsRequired : JSON.stringify(body.documentsRequired || []),
        applicationProcess: typeof body.applicationProcess === 'string' ? body.applicationProcess : JSON.stringify(body.applicationProcess || []),
        officialLink: body.officialLink,
        departmentEn: body.departmentEn,
        departmentHi: body.departmentHi,
        level: body.level,
        status: body.status,
      },
      include: { category: true },
    });

    return NextResponse.json({ scheme: updated });
  } catch (error: any) {
    console.error('Update scheme error:', error);
    return NextResponse.json({ error: 'Failed to update scheme: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    const { id } = params;
    await prisma.scheme.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Scheme deleted successfully' });
  } catch (error: any) {
    console.error('Delete scheme error:', error);
    return NextResponse.json({ error: 'Failed to delete scheme: ' + error.message }, { status: 500 });
  }
}
