const { Client } = require('pg');

async function fixNullDates() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'medmatch_dev'
  });

  try {
    await client.connect();
    console.log('Connected to medmatch_dev database');
    
    // Update NULL start_date values
    const startDateResult = await client.query(`
      UPDATE internship_positions 
      SET start_date = CURRENT_DATE 
      WHERE start_date IS NULL;
    `);
    
    console.log(`Updated ${startDateResult.rowCount} rows with NULL start_date`);
    
    // Update NULL application_deadline values
    const deadlineResult = await client.query(`
      UPDATE internship_positions 
      SET application_deadline = CURRENT_DATE + INTERVAL '30 days' 
      WHERE application_deadline IS NULL;
    `);
    
    console.log(`Updated ${deadlineResult.rowCount} rows with NULL application_deadline`);
    
    console.log('Database updated successfully');
  } catch (err) {
    console.error('Error updating database:', err);
  } finally {
    await client.end();
  }
}

fixNullDates();
