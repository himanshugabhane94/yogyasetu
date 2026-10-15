const fs = require('fs');
const path = require('path');

const groupAB = require('./data/group-a-b');
const groupC = require('./data/group-c');
const groupD = require('./data/group-d');
const groupE1 = require('./data/group-e1');
const groupE2 = require('./data/group-e2');

const allBatch2Schemes = [
  ...groupAB,
  ...groupC,
  ...groupD,
  ...groupE1,
  ...groupE2
];

console.log(`📊 Total Batch 2 Schemes assembled: ${allBatch2Schemes.length}`);

// Validation checks
const validCategories = [
  'students',
  'farmers',
  'women',
  'senior-citizens',
  'divyangjan',
  'employment',
  'housing',
  'health'
];

const seenSlugs = new Set();
const duplicateSlugs = [];
const invalidCategories = [];
const missingFields = [];

allBatch2Schemes.forEach((s, idx) => {
  // Check duplicate slug
  if (seenSlugs.has(s.slug)) {
    duplicateSlugs.push(s.slug);
  }
  seenSlugs.add(s.slug);

  // Check category
  if (!validCategories.includes(s.category)) {
    invalidCategories.push({ index: idx, slug: s.slug, category: s.category });
  }

  // Check essential fields
  if (!s.titleEn || !s.titleHi || !s.slug || !s.officialLink) {
    missingFields.push({ index: idx, slug: s.slug });
  }
});

if (duplicateSlugs.length > 0) {
  console.error('❌ Found duplicate slugs:', duplicateSlugs);
  process.exit(1);
}

if (invalidCategories.length > 0) {
  console.error('❌ Found invalid categories:', invalidCategories);
  process.exit(1);
}

if (missingFields.length > 0) {
  console.error('❌ Found schemes with missing mandatory fields:', missingFields);
  process.exit(1);
}

// Summary stats
const stateCount = allBatch2Schemes.filter(s => s.level === 'STATE').length;
const centralCount = allBatch2Schemes.filter(s => s.level === 'CENTRAL').length;
const maharashtraCount = allBatch2Schemes.filter(s => s.state === 'Maharashtra').length;

console.log(`✅ Validation Passed:`);
console.log(`   - Total Schemes: ${allBatch2Schemes.length}`);
console.log(`   - Maharashtra State Schemes: ${maharashtraCount} (State Level: ${stateCount})`);
console.log(`   - Central Schemes: ${centralCount}`);

// Category breakdown
const categoryCounts = {};
validCategories.forEach(c => (categoryCounts[c] = 0));
allBatch2Schemes.forEach(s => {
  categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
});
console.log('   - Breakdown per category:', categoryCounts);

const outputPath = path.join(__dirname, '..', 'data', 'schemes-batch2.json');
fs.writeFileSync(outputPath, JSON.stringify(allBatch2Schemes, null, 2), 'utf8');
console.log(`💾 Successfully generated ${allBatch2Schemes.length} schemes at ${outputPath}`);
