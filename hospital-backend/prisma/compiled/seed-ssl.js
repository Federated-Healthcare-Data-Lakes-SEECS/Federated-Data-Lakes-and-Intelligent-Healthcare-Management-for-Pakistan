// Wrapper that ensures DATABASE_URL has sslmode=require before running seed
const url = process.env.DATABASE_URL || '';
if (url && !url.includes('sslmode=')) {
  process.env.DATABASE_URL = url.includes('?') 
    ? url + '&sslmode=require' 
    : url + '?sslmode=require';
}

// Now load and run the seed
require('./seed.js');
