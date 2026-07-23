const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  console.log('\n🔧 RUNNING DATABASE MIGRATION FOR SAME-DAY & 7-DAY MISSED REMINDERS\n');
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

    // 1. Add columns to appointments table
    const columnsToAdd = [
      { name: 'reminder_same_day_sent', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'reminder_7day_missed_sent', type: 'BOOLEAN DEFAULT FALSE' }
    ];

    for (const col of columnsToAdd) {
      try {
        await connection.query(`ALTER TABLE appointments ADD COLUMN ${col.name} ${col.type}`);
        console.log(`   ✅ Column '${col.name}' added.`);
      } catch (err) {
        if (err.code === 'ER_DUP_COLUMNNAME') {
          console.log(`   ℹ️  Column '${col.name}' already exists.`);
        } else {
          throw err;
        }
      }
    }

    console.log('='.repeat(70));
    console.log('🎉 Reminder columns migration script executed successfully!\n');
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
