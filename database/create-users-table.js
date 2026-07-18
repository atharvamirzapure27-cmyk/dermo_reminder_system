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

    // 1. Create users table
    console.log('➕ Creating users table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('super_admin', 'admin', 'receptionist') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Users table ready.');

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

    // 3. Insert default super admin user if not exists
    const defaultUsername = 'superadmin';
    const defaultPassword = 'SuperAdmin@123';
    
    const [existing] = await connection.query('SELECT id FROM users WHERE username = ?', [defaultUsername]);
    
    if (existing.length === 0) {
      console.log(`➕ Seeding default Super Admin user: '${defaultUsername}'...`);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);
      
      await connection.query(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [defaultUsername, hashedPassword, 'super_admin']
      );
      console.log('   ✅ Default Super Admin seeded.');
    } else {
      console.log('   ℹ️  Default Super Admin user already exists.');
    }
    
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
