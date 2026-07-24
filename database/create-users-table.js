require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createAuthTables() {
  console.log('\n🔐 CREATING AUTHENTICATION & AUDIT TABLES\n');
  
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root123',
      database: process.env.DB_NAME || 'dermo_reminder_system',
    });
    
    console.log('✅ Connected to database');

    // 1. Create users table (no UNIQUE on username column)
    console.log('➕ Creating users table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('super_admin', 'admin', 'receptionist') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Users table ready.');

    // Try to drop the unique index if it exists from a previous migration
    try {
      await connection.query('ALTER TABLE users DROP INDEX username');
      console.log('   ✅ Removed unique index constraint from users table.');
    } catch (err) {
      // Index might not exist, ignore
    }

    // 2. Create audit_logs table
    console.log('➕ Creating audit_logs table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        username VARCHAR(50) NOT NULL,
        action VARCHAR(255) NOT NULL,
        details TEXT NULL,
        ip_address VARCHAR(45) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Audit logs table ready.');

    // 3. Clear existing user accounts to guarantee only requested credentials exist
    console.log('🧹 Clearing existing user accounts...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('   ✅ User accounts database cleared.');

    // 4. Seed new production credentials
    console.log('🌱 Seeding production credentials...');
    const salt = await bcrypt.genSalt(10);
    
    // Seed Receptionist
    const receptionistPass = await bcrypt.hash('Dermo012026', salt);
    await connection.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      ['Dermatology01', receptionistPass, 'receptionist']
    );
    console.log('   ✅ Receptionist user seeded (Dermatology01 / Dermo012026).');

    // Seed Admin
    const adminPass = await bcrypt.hash('Dermo022026', salt);
    await connection.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      ['Dermatology01', adminPass, 'admin']
    );
    console.log('   ✅ Admin user seeded (Dermatology01 / Dermo022026).');
    
    console.log('\n🎉 Authentication database migration complete!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAuthTables();
