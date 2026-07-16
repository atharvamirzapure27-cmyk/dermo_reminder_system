require('dotenv').config();
const mysql = require('mysql2/promise');

async function addNewColumns() {
  console.log('\n🔧 ADDING VISITED AND MISSED_SENT COLUMNS\n');
  
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root123',
      database: process.env.DB_NAME || 'dermo_reminder_system',
    });
    
    console.log('✅ Connected to database\n');
    
    // Check if visited column exists
    const [visitedColumns] = await connection.query(`
      SHOW COLUMNS FROM appointments LIKE 'visited'
    `);
    
    if (visitedColumns.length === 0) {
      console.log('➕ Adding visited column...');
      await connection.query(`
        ALTER TABLE appointments 
        ADD COLUMN visited BOOLEAN DEFAULT FALSE 
        AFTER reminder_sent
      `);
      console.log('✅ visited column added!\n');
    } else {
      console.log('ℹ️  visited column already exists\n');
    }
    
    // Check if missed_sent column exists
    const [missedColumns] = await connection.query(`
      SHOW COLUMNS FROM appointments LIKE 'missed_sent'
    `);
    
    if (missedColumns.length === 0) {
      console.log('➕ Adding missed_sent column...');
      await connection.query(`
        ALTER TABLE appointments 
        ADD COLUMN missed_sent BOOLEAN DEFAULT FALSE 
        AFTER visited
      `);
      console.log('✅ missed_sent column added!\n');
    } else {
      console.log('ℹ️  missed_sent column already exists\n');
    }
    
    // Display current table structure
    console.log('📋 Current appointments table structure:');
    const [columns] = await connection.query(`
      DESCRIBE appointments
    `);
    console.table(columns);
    
    // Count existing data
    console.log('\n📊 Appointment Statistics:');
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(visited = TRUE) as visited_count,
        SUM(visited = FALSE) as not_visited_count,
        SUM(reminder_sent = TRUE) as reminder_sent_count,
        SUM(missed_sent = TRUE) as missed_sent_count
      FROM appointments
    `);
    console.table(stats);
    
    console.log('\n✅ Database migration completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addNewColumns();
