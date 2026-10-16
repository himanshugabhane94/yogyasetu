import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const category = searchParams.get('category')?.trim();
    const state = searchParams.get('state')?.trim();
    const gender = searchParams.get('gender')?.trim();
    const caste = searchParams.get('caste')?.trim();
    const benefitType = searchParams.get('benefitType')?.trim();
    const status = searchParams.get('status')?.trim() || 'PUBLISHED';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '12', 10));
    const skip = (page - 1) * limit;

    // Optional user session to check bookmarks
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const conditions: any[] = [];

    // Status filter (allow all if admin/officer requests it)
    const isAdminOrOfficer = ['ADMIN', 'VERIFIED_OFFICER'].includes((session?.user as any)?.role);
    if (status !== 'ALL') {
      conditions.push({ status });
    } else if (!isAdminOrOfficer) {
      conditions.push({ status: 'PUBLISHED' });
    }

    // Category filter
    if (category && category !== 'all') {
      conditions.push({
        category: {
          OR: [
            { slug: category },
            { id: category },
          ],
        },
      });
    }

    // Benefit Type filter
    if (benefitType && benefitType !== 'all') {
      conditions.push({ benefitType });
    }

    // Level filter (CENTRAL vs STATE)
    const level = searchParams.get('level')?.trim();
    if (level && level.toLowerCase() !== 'all') {
      conditions.push({ level: level.toUpperCase() });
    }

    // State Scope filter (e.g. Maharashtra vs Central)
    if (state && state !== 'All') {
      if (state.toLowerCase() === 'maharashtra') {
        conditions.push({
          OR: [
            { state: 'Maharashtra' },
            { state: 'maharashtra' },
          ],
        });
      } else if (state.toLowerCase() === 'central') {
        conditions.push({ level: 'CENTRAL' });
      } else {
        conditions.push({
          OR: [
            { state: state },
            { state: null },
          ],
        });
      }
    }

    // Tag filter (e.g. hostel, mahadbt, skills)
    const tag = searchParams.get('tag')?.trim();
    if (tag && tag.toLowerCase() !== 'all') {
      conditions.push({ tags: { contains: tag, mode: 'insensitive' } });
    }

    // Search query (case-insensitive search)
    if (search) {
      conditions.push({
        OR: [
          { titleEn: { contains: search, mode: 'insensitive' } },
          { titleHi: { contains: search, mode: 'insensitive' } },
          { descriptionEn: { contains: search, mode: 'insensitive' } },
          { descriptionHi: { contains: search, mode: 'insensitive' } },
          { departmentEn: { contains: search, mode: 'insensitive' } },
          { departmentHi: { contains: search, mode: 'insensitive' } },
          { tags: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const where = conditions.length > 0 ? { AND: conditions } : {};

    const [schemes, totalCount] = await Promise.all([
      prisma.scheme.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              nameEn: true,
              nameHi: true,
              slug: true,
              icon: true,
            },
          },
          bookmarks: userId
            ? {
                where: { userId },
                select: { id: true },
              }
            : false,
        },
        orderBy: { viewsCount: 'desc' },
        skip,
        take: limit,
      }),
      prisma.scheme.count({ where }),
    ]);

    // Client-side structured JSON filters if state, gender, or caste specified
    let filtered = schemes.map((s: any) => ({
      ...s,
      isBookmarked: Boolean(s.bookmarks && s.bookmarks.length > 0),
    }));

    if (state && state !== 'All') {
      filtered = filtered.filter((s: any) => {
        try {
          const crit = JSON.parse(s.eligibilityJson || '{}');
          const states = crit.states || ['All'];
          return states.includes('All') || states.includes(state);
        } catch {
          return true;
        }
      });
    }

    if (gender && gender !== 'All') {
      filtered = filtered.filter((s: any) => {
        try {
          const crit = JSON.parse(s.eligibilityJson || '{}');
          const targetGender = crit.gender || 'All';
          return targetGender === 'All' || targetGender.toLowerCase() === gender.toLowerCase();
        } catch {
          return true;
        }
      });
    }

    if (caste && caste !== 'All') {
      filtered = filtered.filter((s: any) => {
        try {
          const crit = JSON.parse(s.eligibilityJson || '{}');
          const cats = crit.categories || ['All'];
          return cats.includes('All') || cats.includes(caste);
        } catch {
          return true;
        }
      });
    }

    return NextResponse.json({
      schemes: filtered,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error('Fetch schemes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schemes: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'VERIFIED_OFFICER'].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: 'Unauthorized. Admin or Officer privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      categoryId,
      titleEn,
      titleHi,
      descriptionEn,
      descriptionHi,
      benefitsEn,
      benefitsHi,
      benefitType,
      benefitAmount,
      eligibilityJson,
      documentsRequired,
      applicationProcess,
      officialLink,
      departmentEn,
      departmentHi,
      level,
      status,
    } = body;

    if (!categoryId || !titleEn || !officialLink) {
      return NextResponse.json({ error: 'Category, Title, and Official Link are required' }, { status: 400 });
    }

    const newScheme = await prisma.scheme.create({
      data: {
        categoryId,
        titleEn,
        titleHi: titleHi || titleEn,
        descriptionEn: descriptionEn || '',
        descriptionHi: descriptionHi || '',
        benefitsEn: benefitsEn || '',
        benefitsHi: benefitsHi || '',
        benefitType: benefitType || 'Financial',
        benefitAmount: benefitAmount || null,
        eligibilityJson: typeof eligibilityJson === 'string' ? eligibilityJson : JSON.stringify(eligibilityJson || {}),
        documentsRequired: typeof documentsRequired === 'string' ? documentsRequired : JSON.stringify(documentsRequired || []),
        applicationProcess: typeof applicationProcess === 'string' ? applicationProcess : JSON.stringify(applicationProcess || []),
        officialLink,
        departmentEn: departmentEn || 'Government of India',
        departmentHi: departmentHi || 'भारत सरकार',
        level: level || 'Central',
        status: status || 'VERIFIED',
        createdByAdminId: (session.user as any)?.id,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ scheme: newScheme }, { status: 201 });
  } catch (error: any) {
    console.error('Create scheme error:', error);
    return NextResponse.json({ error: 'Failed to create scheme: ' + error.message }, { status: 500 });
  }
}
