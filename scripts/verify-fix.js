const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('data/schemes').filter(f => f.endsWith('.json') && f !== 'scheme.template.json');

const slugMap = new Map();
let duplicateSlugs = 0;
let invalidProtocolUrls = 0;
let emptyUrlCount = 0;
let validUrlCount = 0;
let totalSchemes = 0;
const urlToSchemes = new Map();

for (const file of files) {
  const schemes = JSON.parse(fs.readFileSync(path.join('data/schemes', file), 'utf8'));
  for (const s of schemes) {
    totalSchemes++;

    // 1. Slug uniqueness
    if (slugMap.has(s.slug)) {
      duplicateSlugs++;
      console.error(`❌ Duplicate slug: "${s.slug}" in ${file} (already in ${slugMap.get(s.slug)})`);
    } else {
      slugMap.set(s.slug, file);
    }

    // 2. URL verification
    const url = (s.applyUrl || '').trim();
    if (!url) {
      emptyUrlCount++;
    } else {
      validUrlCount++;
      if (!url.startsWith('https://')) {
        invalidProtocolUrls++;
        console.error(`❌ Non-HTTPS URL: [${s.slug}] -> ${url}`);
      }

      if (!urlToSchemes.has(url)) {
        urlToSchemes.set(url, []);
      }
      urlToSchemes.get(url).push({ slug: s.slug, title: s.title_en, file });
    }

    // 3. Name consistency check (Card uses titleEn/titleHi, Detail page uses titleEn/titleHi)
    if (!s.title_en || !s.title_en.trim()) {
      console.error(`❌ Missing title_en: [${s.slug}] in ${file}`);
    }
  }
}

// 4. Check data/needs-review.json
let needsReviewCount = 0;
let needsReviewValid = false;
if (fs.existsSync('data/needs-review.json')) {
  const needsReviewData = JSON.parse(fs.readFileSync('data/needs-review.json', 'utf8'));
  needsReviewCount = needsReviewData.length;
  needsReviewValid = Array.isArray(needsReviewData) && needsReviewData.every(item => item.name && item.slug && item.category);
}

// 5. Shared URLs reporting
const sharedUrls = Array.from(urlToSchemes.entries())
  .filter(([_, list]) => list.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

console.log('====================================================');
console.log('           YOGYASETU VERIFICATION REPORT            ');
console.log('====================================================');
console.log(`Total Schemes Checked:           ${totalSchemes}`);
console.log(`Unique Slugs:                    ${slugMap.size} (Duplicate slugs: ${duplicateSlugs})`);
console.log(`Valid Active HTTPS URLs:         ${validUrlCount}`);
console.log(`Non-HTTPS URLs:                  ${invalidProtocolUrls}`);
console.log(`Empty URLs (Disabled/Offline):   ${emptyUrlCount}`);
console.log(`Schemes in data/needs-review.json: ${needsReviewCount} (Schema valid: ${needsReviewValid})`);
console.log(`Match (Empty URLs == Needs Review Count): ${emptyUrlCount === needsReviewCount ? '✅ PERFECT MATCH' : '⚠️ MISMATCH'}`);
console.log('----------------------------------------------------');
console.log(`Shared Official Portals Count:   ${sharedUrls.length}`);
console.log('Top Shared Portals (Verified Common Platforms):');
for (const [url, list] of sharedUrls.slice(0, 10)) {
  console.log(`  • ${list.length} schemes -> ${url}`);
}
console.log('====================================================');

if (duplicateSlugs === 0 && invalidProtocolUrls === 0 && emptyUrlCount === needsReviewCount) {
  console.log('✅ ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error('❌ VERIFICATION CHECKS FAILED!');
  process.exit(1);
}
