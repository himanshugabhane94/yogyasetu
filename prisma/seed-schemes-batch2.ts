import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Default 12 master categories required by YogyaSetu
const DEFAULT_CATEGORIES = [
  { slug: 'students', nameEn: 'Students & Youth', nameHi: 'छात्र एवं युवा', icon: 'GraduationCap' },
  { slug: 'farmers', nameEn: 'Farmers & Agriculture', nameHi: 'किसान एवं कृषि', icon: 'Sprout' },
  { slug: 'women', nameEn: 'Women & Child', nameHi: 'महिला एवं बाल विकास', icon: 'HeartHandshake' },
  { slug: 'senior-citizens', nameEn: 'Senior Citizens', nameHi: 'वरिष्ठ नागरिक', icon: 'Award' },
  { slug: 'divyangjan', nameEn: 'Persons with Disabilities', nameHi: 'दिव्यांगजन', icon: 'Accessibility' },
  { slug: 'hostels', nameEn: 'Government Hostels', nameHi: 'शासकीय वसतिगृह', icon: 'Building2' },
  { slug: 'mahadbt', nameEn: 'Maha DBT', nameHi: 'महाडीबीटी योजना', icon: 'Landmark' },
  { slug: 'health', nameEn: 'Health & Wellness', nameHi: 'स्वास्थ्य एवं परिवार कल्याण', icon: 'HeartPulse' },
  { slug: 'housing', nameEn: 'Housing & Shelter', nameHi: 'आवास एवं आश्रय', icon: 'Home' },
  { slug: 'employment', nameEn: 'Employment & Livelihoods', nameHi: 'रोजगार एवं उपजीविका', icon: 'Briefcase' },
  { slug: 'skills', nameEn: 'Skill Development', nameHi: 'कौशल विकास', icon: 'Lightbulb' },
  { slug: 'minority', nameEn: 'Minority Welfare', nameHi: 'अल्पसंख्यक कल्याण', icon: 'Users' },
];

interface RawSchemeBatch2 {
  slug: string;
  titleEn: string;
  titleHi: string;
  category: string;
  level: string;
  state: string | null;
  departmentEn: string;
  departmentHi: string;
  descriptionEn: string;
  descriptionHi: string;
  benefitType: string;
  benefitAmount?: string | null;
  benefitsEn: string;
  benefitsHi: string;
  eligibilityJson: any;
  documentsRequired: string[];
  applicationProcess: any[];
  officialLink: string;
  lastVerified?: string | null;
}

async function ensureCategories(): Promise<Map<string, string>> {
  const categoryMap = new Map<string, string>();

  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findUnique({
      where: { slug: cat.slug },
    });

    if (existing) {
      categoryMap.set(cat.slug, existing.id);
    } else {
      const created = await prisma.category.create({
        data: {
          slug: cat.slug,
          nameEn: cat.nameEn,
          nameHi: cat.nameHi,
          icon: cat.icon,
        },
      });
      categoryMap.set(cat.slug, created.id);
      console.log(`✨ Created missing category: ${cat.nameEn} (${cat.slug})`);
    }
  }

  return categoryMap;
}

async function main() {
  console.log('🚀 Starting YogyaSetu Batch 2 Scheme Seeding (Idempotent Upsert)...');

  // 1. Ensure Categories exist in DB
  const categoryMap = await ensureCategories();

  // 2. Locate and load schemes file
  const customFile = process.argv[2];
  const candidates = [
    customFile,
    path.join(process.cwd(), 'data', 'schemes-batch2.json'),
    path.resolve('data', 'schemes-batch2.json'),
  ].filter(Boolean) as string[];

  let dataFilePath = '';
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      dataFilePath = c;
      break;
    }
  }

  if (!dataFilePath) {
    throw new Error('❌ Could not locate data/schemes-batch2.json. Please generate it first.');
  }

  console.log(`📖 Loading scheme dataset from: ${dataFilePath}`);
  const fileContent = fs.readFileSync(dataFilePath, 'utf8');
  const rawSchemes: RawSchemeBatch2[] = JSON.parse(fileContent);
  console.log(`📦 Loaded ${rawSchemes.length} schemes ready for batch processing.\n`);

  // 3. Batch processing parameters
  const BATCH_SIZE = 25;
  const totalSchemes = rawSchemes.length;
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;

  const categoryStats: Record<string, number> = {};
  let maharashtraCount = 0;
  let centralCount = 0;
  const unverifiedFieldsList: { slug: string; emptyFields: string[] }[] = [];

  for (let i = 0; i < totalSchemes; i += BATCH_SIZE) {
    const batch = rawSchemes.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const batchStart = i + 1;
    const batchEnd = Math.min(i + BATCH_SIZE, totalSchemes);

    console.log(`⏳ Processing Batch #${batchNumber} (Schemes ${batchStart} to ${batchEnd} of ${totalSchemes})...`);

    for (const scheme of batch) {
      if (!scheme.slug || !scheme.titleEn || !scheme.officialLink) {
        console.warn(`⚠️ Skipping invalid scheme record (missing slug/title/link):`, scheme);
        totalSkipped++;
        continue;
      }

      const categoryId = categoryMap.get(scheme.category);
      if (!categoryId) {
        console.warn(`⚠️ Category '${scheme.category}' not found for slug '${scheme.slug}'. Skipping.`);
        totalSkipped++;
        continue;
      }

      // Check for unverified/empty fields
      const emptyFields: string[] = [];
      if (!scheme.benefitAmount) emptyFields.push('benefitAmount');
      if (scheme.eligibilityJson?.maxIncome === null) emptyFields.push('maxIncome (No limit)');
      if (emptyFields.length > 0) {
        unverifiedFieldsList.push({ slug: scheme.slug, emptyFields });
      }

      // Check if scheme already exists by slug
      const existing = await prisma.scheme.findUnique({
        where: { slug: scheme.slug },
      });

      const payload = {
        categoryId,
        titleEn: scheme.titleEn.trim(),
        titleHi: scheme.titleHi.trim(),
        descriptionEn: scheme.descriptionEn.trim(),
        descriptionHi: scheme.descriptionHi.trim(),
        benefitsEn: scheme.benefitsEn.trim(),
        benefitsHi: scheme.benefitsHi.trim(),
        benefitType: scheme.benefitType || 'Financial',
        benefitAmount: scheme.benefitAmount || null,
        eligibilityJson: typeof scheme.eligibilityJson === 'string'
          ? scheme.eligibilityJson
          : JSON.stringify(scheme.eligibilityJson),
        documentsRequired: typeof scheme.documentsRequired === 'string'
          ? scheme.documentsRequired
          : JSON.stringify(scheme.documentsRequired),
        applicationProcess: typeof scheme.applicationProcess === 'string'
          ? scheme.applicationProcess
          : JSON.stringify(scheme.applicationProcess),
        officialLink: scheme.officialLink.trim(),
        departmentEn: scheme.departmentEn.trim(),
        departmentHi: scheme.departmentHi.trim(),
        level: scheme.level === 'STATE' ? 'STATE' : 'CENTRAL',
        state: scheme.state === 'Maharashtra' ? 'Maharashtra' : null,
        lastVerified: scheme.lastVerified ? new Date(scheme.lastVerified) : new Date(),
        status: 'PUBLISHED',
      };

      try {
        await prisma.scheme.upsert({
          where: { slug: scheme.slug },
          update: payload,
          create: {
            slug: scheme.slug,
            ...payload,
          },
        });

        if (existing) {
          totalUpdated++;
        } else {
          totalCreated++;
        }

        // Tally statistics
        categoryStats[scheme.category] = (categoryStats[scheme.category] || 0) + 1;
        if (scheme.state === 'Maharashtra' || scheme.level === 'STATE') {
          maharashtraCount++;
        } else {
          centralCount++;
        }
      } catch (err: any) {
        console.error(`❌ Error upserting scheme ${scheme.slug}:`, err.message);
        totalSkipped++;
      }
    }

    console.log(`   ✔️  Batch #${batchNumber} complete.`);
  }

  // 4. Final summary output
  console.log('\n======================================================');
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
  console.log(`📊 Total Processed : ${totalSchemes}`);
  console.log(`✨ Newly Created   : ${totalCreated}`);
  console.log(`🔄 Updated         : ${totalUpdated}`);
  console.log(`⏭️  Skipped         : ${totalSkipped}`);
  console.log(`\n🇮🇳 Scope Breakdown:`);
  console.log(`   - Maharashtra State Schemes : ${maharashtraCount}`);
  console.log(`   - Central Government Schemes : ${centralCount}`);
  console.log(`\n📂 Category Breakdown:`);
  for (const [cat, count] of Object.entries(categoryStats)) {
    console.log(`   - ${cat.padEnd(16)} : ${count} schemes`);
  }
  console.log('======================================================\n');
}

main()
  .catch((e) => {
    console.error('Fatal error in seed-schemes-batch2:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
