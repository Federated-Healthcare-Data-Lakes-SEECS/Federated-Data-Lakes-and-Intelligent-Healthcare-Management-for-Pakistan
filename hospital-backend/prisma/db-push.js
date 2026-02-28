// Ensures DATABASE_URL has sslmode=require, then runs prisma db push
const url = process.env.DATABASE_URL || '';
if (url && !url.includes('sslmode=')) {
  process.env.DATABASE_URL = url.includes('?')
    ? url + '&sslmode=require'
    : url + '?sslmode=require';
}
console.log('DATABASE_URL configured with SSL');

const { execSync } = require('child_process');
try {
  execSync('npx prisma db push --force-reset --accept-data-loss', { stdio: 'inherit' });
  console.log('\nDatabase schema pushed successfully!');
} catch (e) {
  console.error('Failed to push schema:', e.message);
  process.exit(1);
}
