import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env or .env.local if present
function loadEnv() {
  const envFiles = ['.env', '.env.local', '.env.production', '.env.development'];
  for (const envFile of envFiles) {
    const envPath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        for (const line of content.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const match = trimmed.match(/^([^=]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }
}
loadEnv();

let prisma: PrismaClient;
function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

// 12 Canonical Categories required by YogyaSetu
const MASTER_CATEGORIES = [
  { slug: 'students', nameEn: 'Students', nameHi: 'छात्र एवं युवा', icon: 'GraduationCap', descriptionEn: 'Scholarships, higher education grants, coaching subsidies' },
  { slug: 'farmers', nameEn: 'Farmers', nameHi: 'किसान एवं कृषि', icon: 'Sprout', descriptionEn: 'Direct income assistance, crop insurance, irrigation, solar pumps' },
  { slug: 'women', nameEn: 'Women', nameHi: 'महिला एवं बाल विकास', icon: 'HeartHandshake', descriptionEn: 'Maternity assistance, self-help groups, girl child protection' },
  { slug: 'senior-citizens', nameEn: 'Senior Citizens', nameHi: 'वरिष्ठ नागरिक', icon: 'Award', descriptionEn: 'Old age pensions, assisted living aids, social security' },
  { slug: 'divyangjan', nameEn: 'Disabled Persons', nameHi: 'दिव्यांगजन', icon: 'Accessibility', descriptionEn: 'Assistive devices, disability pensions, UDID benefits' },
  { slug: 'hostels', nameEn: 'Government Hostels', nameHi: 'शासकीय वसतिगृह', icon: 'Building2', descriptionEn: 'Free student hostels, residential schools, boarding allowances' },
  { slug: 'mahadbt', nameEn: 'Maha DBT', nameHi: 'महाडीबीटी योजना', icon: 'Landmark', descriptionEn: 'Maharashtra Government direct benefit transfer schemes and fee waivers' },
  { slug: 'health', nameEn: 'Health', nameHi: 'स्वास्थ्य एवं परिवार कल्याण', icon: 'HeartPulse', descriptionEn: 'Cashless hospital treatment, generic medicine stores, child screenings' },
  { slug: 'housing', nameEn: 'Housing', nameHi: 'आवास एवं आश्रय', icon: 'Home', descriptionEn: 'Pucca house subsidies, rural and urban housing grants' },
  { slug: 'employment', nameEn: 'Employment', nameHi: 'रोजगार एवं उपजीविका', icon: 'Briefcase', descriptionEn: 'Guaranteed rural wage employment, entrepreneurship loans, subsidies' },
  { slug: 'skills', nameEn: 'Skill Development', nameHi: 'कौशल विकास', icon: 'Lightbulb', descriptionEn: 'Vocational training, apprentice stipends, certified trade programs' },
  { slug: 'minority', nameEn: 'Minority', nameHi: 'अल्पसंख्यक कल्याण', icon: 'Users', descriptionEn: 'Scholarships, education loans, and social welfare for religious minorities' },
];

// Flexible category resolver
const CATEGORY_ALIASES: Record<string, string> = {
  // Students
  students: 'students',
  student: 'students',
  youth: 'students',
  education: 'students',
  scholarship: 'students',
  scholarships: 'students',

  // Farmers
  farmers: 'farmers',
  farmer: 'farmers',
  agriculture: 'farmers',
  kisan: 'farmers',
  krishi: 'farmers',

  // Women
  women: 'women',
  woman: 'women',
  mahila: 'women',
  child: 'women',
  maternity: 'women',
  kanya: 'women',

  // Senior Citizens
  'senior-citizens': 'senior-citizens',
  senior: 'senior-citizens',
  seniors: 'senior-citizens',
  elderly: 'senior-citizens',
  pension: 'senior-citizens',
  vridha: 'senior-citizens',

  // Disabled Persons
  divyangjan: 'divyangjan',
  disabled: 'divyangjan',
  disability: 'divyangjan',
  'disabled persons': 'divyangjan',
  'disabled-persons': 'divyangjan',
  handicapped: 'divyangjan',

  // Government Hostels
  hostels: 'hostels',
  hostel: 'hostels',
  'government hostels': 'hostels',
  'government-hostels': 'hostels',
  residential: 'hostels',
  vasatigruh: 'hostels',
  swadhar: 'hostels',

  // Maha DBT
  mahadbt: 'mahadbt',
  'maha dbt': 'mahadbt',
  'maha-dbt': 'mahadbt',
  dbt: 'mahadbt',

  // Health
  health: 'health',
  healthcare: 'health',
  medical: 'health',
  hospital: 'health',
  swasthya: 'health',
  arogya: 'health',

  // Housing
  housing: 'housing',
  shelter: 'housing',
  awas: 'housing',
  gharkul: 'housing',
  house: 'housing',

  // Employment
  employment: 'employment',
  job: 'employment',
  jobs: 'employment',
  livelihood: 'employment',
  business: 'employment',
  enterprise: 'employment',
  msme: 'employment',
  mudra: 'employment',

  // Skill Development
  skills: 'skills',
  skill: 'skills',
  'skill development': 'skills',
  'skill-development': 'skills',
  vocational: 'skills',
  training: 'skills',
  apprenticeship: 'skills',

  // Minority
  minority: 'minority',
  minorities: 'minority',
  'minority welfare': 'minority',
  'minority-welfare': 'minority',
  alpasankhyak: 'minority',
};

function resolveCategorySlug(rawCategory?: string): string {
  if (!rawCategory) return 'employment';
  const clean = rawCategory.trim().toLowerCase();
  return CATEGORY_ALIASES[clean] || 'employment';
}

async function ensureCategories(): Promise<Map<string, string>> {
  const categoryMap = new Map<string, string>();
  const db = getPrisma();

  for (const cat of MASTER_CATEGORIES) {
    let existing = await db.category.findUnique({
      where: { slug: cat.slug },
    });

    if (!existing) {
      existing = await db.category.create({
        data: {
          slug: cat.slug,
          nameEn: cat.nameEn,
          nameHi: cat.nameHi,
          icon: cat.icon,
          descriptionEn: cat.descriptionEn,
        },
      });
      console.log(`✨ Created master category: ${cat.nameEn} (${cat.slug})`);
    }

    categoryMap.set(cat.slug, existing.id);
  }

  return categoryMap;
}

function findJsonFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      // Ignore template file if it only has sample dummy data
      if (entry.name === 'scheme.template.json') continue;
      results.push(fullPath);
    }
  }
  return results;
}

async function main() {
  console.log('======================================================');
  console.log('🚀 YogyaSetu Bulk Scheme Importer (500+ Architecture)');
  console.log('======================================================\n');

  // 1. Discover scheme files
  const argTarget = process.argv[2];
  const targetDir = argTarget
    ? path.resolve(argTarget)
    : path.resolve(process.cwd(), 'data', 'schemes');

  let targetFiles: string[] = [];

  if (fs.existsSync(targetDir)) {
    if (fs.statSync(targetDir).isDirectory()) {
      targetFiles = findJsonFiles(targetDir);
    } else if (targetDir.endsWith('.json')) {
      targetFiles = [targetDir];
    }
  }

  if (targetFiles.length === 0) {
    console.log(`📂 Scanning: ${targetDir}`);
    console.log(`ℹ️  No JSON scheme files found in data/schemes/*.json (scheme.template.json is skipped).`);
    console.log(`✨ The bulk importer architecture is fully configured and ready for 500+ schemes!`);
    console.log(`💡 To import schemes, drop your JSON files into /data/schemes/*.json and execute:`);
    console.log(`   npm run import:schemes\n`);
    console.log(`📖 Refer to data/schemes/README.md for the standard JSON schema specification.`);
    return;
  }

  // 2. Validate database configuration
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is not defined.');
    console.error('Please configure DATABASE_URL in your .env or .env.local file.');
    process.exit(1);
  }

  // 3. Ensure master categories exist
  const categoryMap = await ensureCategories();

  console.log(`📂 Found ${targetFiles.length} JSON file(s) to process:`);
  targetFiles.forEach((f) => console.log(`   - ${path.relative(process.cwd(), f)}`));
  console.log('');

  // 4. Collect and flatten all scheme items
  const allSchemes: any[] = [];
  for (const filePath of targetFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        allSchemes.push(...parsed);
      } else if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.schemes)) {
          allSchemes.push(...parsed.schemes);
        } else if (Array.isArray(parsed.data)) {
          allSchemes.push(...parsed.data);
        } else if (parsed.slug && parsed.slug !== 'sample-scheme-unique-slug') {
          allSchemes.push(parsed);
        }
      }
    } catch (err: any) {
      console.error(`❌ Error parsing file ${filePath}:`, err.message);
    }
  }

  console.log(`📦 Loaded ${allSchemes.length} total scheme records.\n`);

  // 4. Batch Processing with Upsert
  const BATCH_SIZE = 25;
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  const categoryStats: Record<string, number> = {};
  let maharashtraCount = 0;
  let centralCount = 0;

  for (let i = 0; i < allSchemes.length; i += BATCH_SIZE) {
    const batch = allSchemes.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const startIdx = i + 1;
    const endIdx = Math.min(i + BATCH_SIZE, allSchemes.length);

    console.log(`⏳ Processing Batch #${batchNum} (Schemes ${startIdx} - ${endIdx} of ${allSchemes.length})...`);

    for (const raw of batch) {
      const slug = (raw.slug || '').trim();
      const titleEn = (raw.title_en || raw.titleEn || raw.title || '').trim();
      const titleHi = (raw.title_hi || raw.titleHi || titleEn).trim();

      // Skip invalid or placeholder records
      if (!slug || slug === 'sample-scheme-unique-slug' || !titleEn) {
        console.warn(`   ⚠️ Skipping invalid record (missing slug or title):`, raw.slug || raw.title_en);
        skippedCount++;
        continue;
      }

      // Resolve Category
      const rawCat = raw.category || raw.category_slug || '';
      const resolvedSlug = resolveCategorySlug(rawCat);
      const categoryId = categoryMap.get(resolvedSlug) || categoryMap.get('employment')!;

      // Scope resolution
      const rawLevel = (raw.level || 'CENTRAL').toUpperCase();
      const level = rawLevel === 'STATE' ? 'STATE' : 'CENTRAL';
      const state = raw.state !== undefined ? raw.state : (level === 'STATE' ? 'Maharashtra' : null);

      // Benefits normalization
      let benefitsEn = raw.benefits_en || raw.benefitsEn || '';
      if (Array.isArray(benefitsEn)) benefitsEn = benefitsEn.join('\n');
      let benefitsHi = raw.benefits_hi || raw.benefitsHi || benefitsEn;
      if (Array.isArray(benefitsHi)) benefitsHi = benefitsHi.join('\n');

      // Description normalization
      const descriptionEn = (raw.description_en || raw.descriptionEn || '').trim();
      const descriptionHi = (raw.description_hi || raw.descriptionHi || descriptionEn).trim();

      // Eligibility normalization
      let eligibilityJson = '{}';
      if (typeof raw.eligibility_en === 'object') {
        eligibilityJson = JSON.stringify(raw.eligibility_en);
      } else if (typeof raw.eligibilityJson === 'object') {
        eligibilityJson = JSON.stringify(raw.eligibilityJson);
      } else if (typeof raw.eligibilityJson === 'string') {
        eligibilityJson = raw.eligibilityJson;
      } else if (typeof raw.eligibility_en === 'string') {
        eligibilityJson = JSON.stringify({ criteriaEn: raw.eligibility_en, criteriaHi: raw.eligibility_hi || raw.eligibility_en });
      }

      // Documents normalization
      let documentsRequired = '[]';
      if (Array.isArray(raw.documents_en)) {
        documentsRequired = JSON.stringify(raw.documents_en);
      } else if (Array.isArray(raw.documentsRequired)) {
        documentsRequired = JSON.stringify(raw.documentsRequired);
      } else if (typeof raw.documentsRequired === 'string') {
        documentsRequired = raw.documentsRequired;
      } else if (typeof raw.documents_en === 'string') {
        documentsRequired = JSON.stringify([raw.documents_en]);
      }

      // Steps normalization
      let applicationProcess = '[]';
      if (Array.isArray(raw.steps_en)) {
        applicationProcess = JSON.stringify(
          raw.steps_en.map((st: any, idx: number) => {
            if (typeof st === 'string') {
              return {
                step: idx + 1,
                titleEn: st,
                titleHi: Array.isArray(raw.steps_hi) && raw.steps_hi[idx] ? raw.steps_hi[idx] : st,
                descEn: st,
                descHi: Array.isArray(raw.steps_hi) && raw.steps_hi[idx] ? raw.steps_hi[idx] : st,
              };
            }
            return {
              step: st.step || idx + 1,
              titleEn: st.title || st.titleEn || `Step ${idx + 1}`,
              titleHi: st.titleHi || (Array.isArray(raw.steps_hi) && raw.steps_hi[idx]?.title) || st.title || `टप्पा ${idx + 1}`,
              descEn: st.desc || st.descEn || '',
              descHi: st.descHi || (Array.isArray(raw.steps_hi) && raw.steps_hi[idx]?.desc) || st.desc || '',
            };
          })
        );
      } else if (Array.isArray(raw.applicationProcess)) {
        applicationProcess = JSON.stringify(raw.applicationProcess);
      } else if (typeof raw.applicationProcess === 'string') {
        applicationProcess = raw.applicationProcess;
      }

      // Links & Meta
      const officialLink = (raw.applyUrl || raw.officialLink || raw.sourceUrl || 'https://myscheme.gov.in').trim();
      const sourceUrl = (raw.sourceUrl || raw.officialLink || null);
      const departmentEn = (raw.department_en || raw.departmentEn || (level === 'STATE' ? 'Government of Maharashtra' : 'Government of India')).trim();
      const departmentHi = (raw.department_hi || raw.departmentHi || (level === 'STATE' ? 'महाराष्ट्र शासन' : 'भारत सरकार')).trim();
      const benefitType = raw.benefitType || raw.benefit_type || 'Financial';
      const benefitAmount = raw.benefitAmount || raw.benefit_amount || null;
      const lastVerified = raw.lastVerified ? new Date(raw.lastVerified) : new Date();

      const payload = {
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
        sourceUrl,
        departmentEn,
        departmentHi,
        level,
        state,
        lastVerified,
        status: 'PUBLISHED',
      };

      try {
        const db = getPrisma();
        const existing = await db.scheme.findUnique({
          where: { slug },
          select: { id: true },
        });

        await db.scheme.upsert({
          where: { slug },
          update: payload,
          create: {
            slug,
            ...payload,
          },
        });

        if (existing) {
          updatedCount++;
        } else {
          createdCount++;
        }

        categoryStats[resolvedSlug] = (categoryStats[resolvedSlug] || 0) + 1;
        if (state === 'Maharashtra' || level === 'STATE') {
          maharashtraCount++;
        } else {
          centralCount++;
        }
      } catch (err: any) {
        console.error(`   ❌ Failed to upsert ${slug}:`, err.message);
        skippedCount++;
      }
    }

    console.log(`   ✔️  Batch #${batchNum} complete.`);
  }

  // 5. Final Report
  console.log('\n======================================================');
  console.log('🎉 BULK IMPORT COMPLETED SUCCESSFULLY');
  console.log('======================================================');
  console.log(`📊 Total Records Read : ${allSchemes.length}`);
  console.log(`✨ Newly Created      : ${createdCount}`);
  console.log(`🔄 Updated / Synced   : ${updatedCount}`);
  console.log(`⏭️  Skipped            : ${skippedCount}`);
  console.log(`\n🇮🇳 Scope Breakdown:`);
  console.log(`   - Maharashtra State Schemes : ${maharashtraCount}`);
  console.log(`   - Central Government Schemes: ${centralCount}`);
  console.log(`\n📂 Category Breakdown:`);
  for (const [cat, count] of Object.entries(categoryStats)) {
    console.log(`   - ${cat.padEnd(16)} : ${count} scheme(s)`);
  }
  console.log('======================================================\n');
}

main()
  .catch((err) => {
    console.error('Fatal execution error during bulk import:', err);
    process.exit(1);
  })
  .finally(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });
