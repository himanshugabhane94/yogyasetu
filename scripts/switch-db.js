const fs = require('fs');
const path = require('path');

const target = process.argv[2] || 'postgres';
const prismaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const pgPath = path.join(__dirname, '..', 'prisma', 'schema.postgresql.prisma');

if (target === 'postgres' || target === 'postgresql') {
  if (fs.existsSync(pgPath)) {
    const pgContent = fs.readFileSync(pgPath, 'utf8');
    fs.writeFileSync(prismaPath, pgContent, 'utf8');
    console.log('✅ Switched Prisma schema to PostgreSQL (Production/Supabase/Neon)');
  }
} else if (target === 'sqlite') {
  let content = fs.readFileSync(prismaPath, 'utf8');
  content = content.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
  content = content.replace(/directUrl\s*=\s*env\(["']DIRECT_URL["']\)\s*\r?\n?/g, '');
  content = content.replace(/@db\.Text/g, '');
  fs.writeFileSync(prismaPath, content, 'utf8');
  console.log('✅ Switched Prisma schema to SQLite (Local zero-config dev)');
}
