const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  console.log('\n🔧 RUNNING DATABASE MIGRATION FOR WHATSAPP & VOICE STATUS TRACKING\n');
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

    // 1. Add status tracking columns to appointments
    console.log('➕ Appending WhatsApp & Voice status fields to appointments table...');
    const columnsToAdd = [
      { name: 'whatsapp_status', type: "ENUM('pending', 'sent', 'failed') DEFAULT 'pending'" },
      { name: 'voice_status', type: "ENUM('pending', 'sent', 'failed') DEFAULT 'pending'" },
      { name: 'whatsapp_sent_at', type: 'DATETIME DEFAULT NULL' },
      { name: 'voice_sent_at', type: 'DATETIME DEFAULT NULL' },
      { name: 'whatsapp_error', type: 'VARCHAR(255) DEFAULT NULL' },
      { name: 'voice_error', type: 'VARCHAR(255) DEFAULT NULL' }
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

    // 2. Create notification_logs table
    console.log('➕ Creating notification_logs table...');
    const createLogsTableQuery = `
      CREATE TABLE IF NOT EXISTS notification_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        appointment_id INT NOT NULL,
        channel ENUM('sms', 'whatsapp_text', 'whatsapp_voice') NOT NULL,
        recipient_phone VARCHAR(20) NOT NULL,
        message_type ENUM('3day_reminder', '1day_reminder', 'missed_reminder') NOT NULL,
        message_text TEXT NOT NULL,
        status ENUM('sent', 'failed', 'retried') NOT NULL DEFAULT 'sent',
        error_message VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await connection.query(createLogsTableQuery);
    console.log('   ✅ Table notification_logs is ready.');

    // 3. Add indexes to notification_logs
    console.log('➕ Creating indexes on notification_logs...');
    try {
      await connection.query('CREATE INDEX idx_notification_logs_appointment_id ON notification_logs(appointment_id)');
      console.log('   ✅ Index idx_notification_logs_appointment_id created.');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('   ℹ️  Index idx_notification_logs_appointment_id already exists.');
      } else {
        throw err;
      }
    }

    try {
      await connection.query('CREATE INDEX idx_notification_logs_status ON notification_logs(status)');
      console.log('   ✅ Index idx_notification_logs_status created.');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('   ℹ️  Index idx_notification_logs_status already exists.');
      } else {
        throw err;
      }
    }

    console.log('='.repeat(70));
    console.log('🎉 WhatsApp & Voice migration script executed successfully!\n');
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
