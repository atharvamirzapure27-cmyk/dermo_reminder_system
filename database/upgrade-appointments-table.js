const mysql = require('mysql2/promise');
require('dotenv').config();

async function upgradeAppointmentsTable() {
  console.log('\n🔧 UPGRADING APPOINTMENTS TABLE FOR PHASE 2\n');
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

    // 1. Add doctor_name
    const [colsDoctor] = await connection.query("SHOW COLUMNS FROM appointments LIKE 'doctor_name'");
    if (colsDoctor.length === 0) {
      console.log('➕ Adding doctor_name column...');
      await connection.query("ALTER TABLE appointments ADD COLUMN doctor_name VARCHAR(100) NOT NULL DEFAULT 'Dr. Priya Sharma' AFTER patient_id");
      console.log('   ✅ Added doctor_name.');
    } else {
      console.log('ℹ️  doctor_name column already exists.');
    }

    // 2. Add department
    const [colsDept] = await connection.query("SHOW COLUMNS FROM appointments LIKE 'department'");
    if (colsDept.length === 0) {
      console.log('➕ Adding department column...');
      await connection.query("ALTER TABLE appointments ADD COLUMN department VARCHAR(100) NOT NULL DEFAULT 'Dermatology' AFTER doctor_name");
      console.log('   ✅ Added department.');
    } else {
      console.log('ℹ️  department column already exists.');
    }

    // 3. Add appointment_time
    const [colsTime] = await connection.query("SHOW COLUMNS FROM appointments LIKE 'appointment_time'");
    if (colsTime.length === 0) {
      console.log('➕ Adding appointment_time column...');
      await connection.query("ALTER TABLE appointments ADD COLUMN appointment_time VARCHAR(20) NOT NULL DEFAULT '10:00 AM' AFTER appointment_date");
      console.log('   ✅ Added appointment_time.');
    } else {
      console.log('ℹ️  appointment_time column already exists.');
    }

    // 4. Add status
    const [colsStatus] = await connection.query("SHOW COLUMNS FROM appointments LIKE 'status'");
    if (colsStatus.length === 0) {
      console.log('➕ Adding status column...');
      await connection.query("ALTER TABLE appointments ADD COLUMN status ENUM('scheduled', 'visited', 'missed', 'cancelled', 'rescheduled') NOT NULL DEFAULT 'scheduled' AFTER appointment_time");
      console.log('   ✅ Added status.');
      
      // Update existing records status based on visited state
      console.log('🔄 Syncing status of existing records...');
      await connection.query("UPDATE appointments SET status = 'visited' WHERE visited = TRUE");
      await connection.query("UPDATE appointments SET status = 'missed' WHERE visited = FALSE AND appointment_date < CURDATE()");
      console.log('   ✅ Status synced.');
    } else {
      console.log('ℹ️  status column already exists.');
    }

    // 5. Add reminder_3day_sent
    const [colsR3] = await connection.query("SHOW COLUMNS FROM appointments LIKE 'reminder_3day_sent'");
    if (colsR3.length === 0) {
      console.log('➕ Adding reminder_3day_sent column...');
      await connection.query("ALTER TABLE appointments ADD COLUMN reminder_3day_sent BOOLEAN DEFAULT FALSE AFTER status");
      console.log('   ✅ Added reminder_3day_sent.');
    } else {
      console.log('ℹ️  reminder_3day_sent column already exists.');
    }

    // 6. Add reminder_1day_sent
    const [colsR1] = await connection.query("SHOW COLUMNS FROM appointments LIKE 'reminder_1day_sent'");
    if (colsR1.length === 0) {
      console.log('➕ Adding reminder_1day_sent column...');
      await connection.query("ALTER TABLE appointments ADD COLUMN reminder_1day_sent BOOLEAN DEFAULT FALSE AFTER reminder_3day_sent");
      console.log('   ✅ Added reminder_1day_sent.');
      // Sync from reminder_sent
      await connection.query("UPDATE appointments SET reminder_1day_sent = TRUE WHERE reminder_sent = TRUE");
    } else {
      console.log('ℹ️  reminder_1day_sent column already exists.');
    }

    // 7. Add reminder_missed_sent
    const [colsRm] = await connection.query("SHOW COLUMNS FROM appointments LIKE 'reminder_missed_sent'");
    if (colsRm.length === 0) {
      console.log('➕ Adding reminder_missed_sent column...');
      await connection.query("ALTER TABLE appointments ADD COLUMN reminder_missed_sent BOOLEAN DEFAULT FALSE AFTER reminder_1day_sent");
      console.log('   ✅ Added reminder_missed_sent.');
      // Sync from missed_sent
      await connection.query("UPDATE appointments SET reminder_missed_sent = TRUE WHERE missed_sent = TRUE");
    } else {
      console.log('ℹ️  reminder_missed_sent column already exists.');
    }

    console.log('='.repeat(60));
    console.log('🎉 Appointments table upgrade migration complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Table upgrade failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

upgradeAppointmentsTable();
