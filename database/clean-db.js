const mysql = require('mysql2/promise');
require('dotenv').config();

async function cleanDatabase() {
  console.log('\n🧹 EXECUTING DATABASE CLEANUP FOR DEMONSTRATION');
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

    // Disable foreign key checks temporarily to safely clean up tables
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // 1. Reset/Clear notification logs
    console.log('🧹 Clearing notification logs...');
    await connection.query('TRUNCATE TABLE notification_logs');
    console.log('   ✅ Notification logs cleared.');

    // 2. Clear appointments
    console.log('🧹 Clearing all appointments...');
    await connection.query('TRUNCATE TABLE appointments');
    console.log('   ✅ Appointments cleared.');

    // 3. Clear patients
    console.log('🧹 Clearing all patients...');
    await connection.query('TRUNCATE TABLE patients');
    console.log('   ✅ Patients cleared.');

    // Enable foreign key checks back
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 4. Seed 4 clean, realistic patient records (English, Hindi, Marathi + Atharva)
    console.log('🌱 Seeding realistic patient records...');
    const [athRes] = await connection.query(
      `INSERT INTO patients (name, phone, language) VALUES (?, ?, ?)`,
      ['Atharva', '9988776655', 'english']
    );
    const athId = athRes.insertId;

    const [johnRes] = await connection.query(
      `INSERT INTO patients (name, phone, language) VALUES (?, ?, ?)`,
      ['John Doe (ENG)', '9876543210', 'english']
    );
    const johnId = johnRes.insertId;

    const [ramRes] = await connection.query(
      `INSERT INTO patients (name, phone, language) VALUES (?, ?, ?)`,
      ['Ram Kumar (HIN)', '9888888888', 'hindi']
    );
    const ramId = ramRes.insertId;

    const [hariRes] = await connection.query(
      `INSERT INTO patients (name, phone, language) VALUES (?, ?, ?)`,
      ['Hari Patil (MAR)', '9777777777', 'marathi']
    );
    const hariId = hariRes.insertId;

    console.log('   ✅ 4 patients seeded.');

    // 5. Seed clean, realistic appointments
    console.log('🌱 Seeding realistic appointments...');

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const threeDaysLaterStr = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Atharva - Today appointment (Same-Day)
    await connection.query(
      `INSERT INTO appointments (patient_id, appointment_date, appointment_time, doctor_name, department, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [athId, todayStr, '10:30 AM', 'Dr. Priya Sharma', 'Dermatology', 'scheduled']
    );

    // John Doe - Tomorrow appointment (1-Day)
    await connection.query(
      `INSERT INTO appointments (patient_id, appointment_date, appointment_time, doctor_name, department, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [johnId, tomorrowStr, '11:15 AM', 'Dr. Priya Sharma', 'Dermatology', 'scheduled']
    );

    // Ram Kumar - 3 Days Later appointment (3-Day)
    await connection.query(
      `INSERT INTO appointments (patient_id, appointment_date, appointment_time, doctor_name, department, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [ramId, threeDaysLaterStr, '02:00 PM', 'Dr. Priya Sharma', 'Dermatology', 'scheduled']
    );

    // Hari Patil - Yesterday appointment (Missed)
    await connection.query(
      `INSERT INTO appointments (patient_id, appointment_date, appointment_time, doctor_name, department, status, visited) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [hariId, yesterdayStr, '09:45 AM', 'Dr. Priya Sharma', 'Dermatology', 'missed', false]
    );

    console.log('   ✅ Appointments seeded.');
    console.log('='.repeat(70));
    console.log('🎉 Database cleanup and seeding complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Database cleanup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

cleanDatabase();
