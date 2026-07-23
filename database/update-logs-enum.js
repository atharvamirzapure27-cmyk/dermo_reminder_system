const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  console.log('\n🔧 RUNNING DATABASE MIGRATION TO UPDATE NOTIFICATION_LOGS MESSAGE_TYPE ENUM\n');
  console.log('='.repeat(70));

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root123',
      database: process.env.DB_NAME || 'dermo_reminder_system',
    });

    console.log('✅ Connected to database');

    console.log('🔄 Modifying message_type column ENUM in notification_logs...');
    await connection.query(`
      ALTER TABLE notification_logs 
      MODIFY COLUMN message_type ENUM(
        '3day_reminder', 
        '1day_reminder', 
        'same_day_reminder', 
        'missed_reminder', 
        '7day_missed_reminder'
      ) NOT NULL
    `);
    console.log('   ✅ Column modified.');

    console.log('='.repeat(70));
    console.log('🎉 Enum migration script executed successfully!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
