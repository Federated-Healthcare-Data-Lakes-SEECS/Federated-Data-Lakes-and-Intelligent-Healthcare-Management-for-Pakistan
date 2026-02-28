// Run seed as a child process with SSL-enabled DATABASE_URL
const url = process.env.DATABASE_URL || '';
if (url && !url.includes('sslmode=')) {
  process.env.DATABASE_URL = url.includes('?')
    ? url + '&sslmode=require'
    : url + '?sslmode=require';
}

console.log('DATABASE_URL set with SSL:', process.env.DATABASE_URL?.substring(0, 40) + '...');

const { execSync } = require('child_process');
try {
  // Run the compiled seed.js as a subprocess so it inherits the SSL-patched env
  execSync('node prisma/compiled/seed.js', { 
    stdio: 'inherit',
    env: process.env 
  });
  console.log('\nSeeding completed successfully!');
} catch (e) {
  console.error('Seeding failed with exit code:', e.status);
  process.exit(1);
}
