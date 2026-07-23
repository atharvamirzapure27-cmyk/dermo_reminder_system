const mysql = require('mysql2/promise');
require('dotenv').config();

async function createSettingsTable() {
  console.log('\n🔧 CREATING NOTIFICATION_SETTINGS TABLE\n');
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

    console.log('➕ Creating notification_settings table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notification_settings (
        id INT PRIMARY KEY,
        sms_enabled BOOLEAN DEFAULT TRUE,
        whatsapp_enabled BOOLEAN DEFAULT TRUE,
        voice_enabled BOOLEAN DEFAULT TRUE,
        email_enabled BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Table notification_settings is ready.');

    // Seed default settings row if missing
    const [existing] = await connection.query('SELECT id FROM notification_settings WHERE id = 1');
    if (existing.length === 0) {
      console.log('🌱 Seeding default notification settings (SMS: ON, WhatsApp: ON, Voice: ON, Email: OFF)...');
      await connection.query(
        `INSERT INTO notification_settings (id, sms_enabled, whatsapp_enabled, voice_enabled, email_enabled) 
         VALUES (1, TRUE, TRUE, TRUE, FALSE)`
      );
      console.log('   ✅ Default settings seeded.');
    } else {
      console.log('   ℹ️  Notification settings row already exists.');
    }

    console.log('='.repeat(70));
    console.log('🎉 Notification settings migration complete!\n');
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

createSettingsTable();
