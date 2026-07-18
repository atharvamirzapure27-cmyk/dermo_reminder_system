const mysql = require('mysql2/promise');
require('dotenv').config();

async function addReminderIndexes() {
  console.log('\n🔧 CREATING DATABASE INDEXES FOR INTENSIVE SCHEDULER SWEEPS\n');
  console.log('='.repeat(60));
  
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root123',
      database: process.env.DB_NAME || 'dermo_reminder_system',
    });
    
    console.log('✅ Connected to database');

    // 1. Add idx_appointments_date_status
    console.log('➕ Creating index idx_appointments_date_status on (appointment_date, status)...');
    try {
      await connection.query("CREATE INDEX idx_appointments_date_status ON appointments (appointment_date, status)");
      console.log('   ✅ Index idx_appointments_date_status created.');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('   ℹ️  Index idx_appointments_date_status already exists.');
      } else {
        throw err;
      }
    }

    // 2. Add idx_appointments_status
    console.log('➕ Creating index idx_appointments_status on (status)...');
    try {
      await connection.query("CREATE INDEX idx_appointments_status ON appointments (status)");
      console.log('   ✅ Index idx_appointments_status created.');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('   ℹ️  Index idx_appointments_status already exists.');
      } else {
        throw err;
      }
    }

    console.log('='.repeat(60));
    console.log('🎉 Database index migration complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Index creation failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addReminderIndexes();
