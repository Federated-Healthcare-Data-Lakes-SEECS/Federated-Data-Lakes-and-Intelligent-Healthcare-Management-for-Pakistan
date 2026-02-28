// Wrapper that ensures DATABASE_URL has sslmode=require before running seed
const url = process.env.DATABASE_URL || '';
if (url && !url.includes('sslmode=')) {
  const sslUrl = url.includes('?') 
    ? url + '&sslmode=require' 
    : url + '?sslmode=require';
  process.env.DATABASE_URL = sslUrl;
  console.log('SSL appended to DATABASE_URL');
} else {
  console.log('DATABASE_URL already has sslmode or is empty');
}
console.log('DATABASE_URL starts with:', (process.env.DATABASE_URL || '').substring(0, 30) + '...');

// Now load and run the seed
require('./seed.js');
