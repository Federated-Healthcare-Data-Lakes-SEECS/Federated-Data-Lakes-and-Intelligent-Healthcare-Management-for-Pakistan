const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`
  .then(tables => {
    console.log('Tables in database:');
    tables.forEach(t => console.log('  -', t.tablename));
    console.log('\nTotal:', tables.length, 'tables');
  })
  .catch(e => console.error('Error:', e.message))
  .finally(() => p.$disconnect());
