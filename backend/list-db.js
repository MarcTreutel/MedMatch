const { Client } = require('pg');

async function listDatabases() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres' // Connect to default postgres database
  });

  try {
    await client.connect();
    console.log('Connected to postgres database');
    
    // List all databases
    const result = await client.query(`
      SELECT datname FROM pg_database 
      WHERE datistemplate = false
      ORDER BY datname;
    `);
    
    console.log('Available databases:');
    result.rows.forEach(row => {
      console.log(`- ${row.datname}`);
    });
  } catch (err) {
    console.error('Error listing databases:', err);
  } finally {
    await client.end();
  }
}

listDatabases();
