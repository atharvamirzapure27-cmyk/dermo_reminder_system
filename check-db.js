require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkDatabase() {
  console.log('\n🔍 DATABASE VERIFICATION SCRIPT\n');
  console.log('=' .repeat(50));
  
  let connection;
  
  try {
    // Test connection
    console.log('\n1️⃣  Testing MySQL Connection...');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   User: ${process.env.DB_USER || 'root'}`);
    console.log(`   Database: ${process.env.DB_NAME || 'dermo_reminder_system'}`);
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root123',
    });
    
    console.log('   ✅ MySQL connection successful!\n');
    
    // Check if database exists
    console.log('2️⃣  Checking Database...');
    const [dbs] = await connection.query(
      'SHOW DATABASES LIKE ?',
      [process.env.DB_NAME || 'dermo_reminder_system']
    );
    
    if (dbs.length === 0) {
      console.log('   ⚠️  Database does not exist. Creating...\n');
      await connection.query(
        'CREATE DATABASE ??',
        [process.env.DB_NAME || 'dermo_reminder_system']
      );
      console.log('   ✅ Database created!\n');
    } else {
      console.log('   ✅ Database exists!\n');
    }
    
    // Use the database
    await connection.query('USE ??', [process.env.DB_NAME || 'dermo_reminder_system']);
    
    // Check tables
    console.log('3️⃣  Checking Tables...');
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    console.log(`   Found tables: ${tableNames.join(', ') || 'None'}\n`);
    
    // Create patients table if not exists
    if (!tableNames.includes('patients')) {
      console.log('   ⚠️  Creating patients table...');
      await connection.query(`
        CREATE TABLE patients (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('   ✅ Patients table created!\n');
    } else {
      console.log('   ✅ Patients table exists!');
      const [count] = await connection.query('SELECT COUNT(*) as count FROM patients');
      console.log(`   📊 Records: ${count[0].count}\n`);
    }
    
    // Create appointments table if not exists
    if (!tableNames.includes('appointments')) {
      console.log('   ⚠️  Creating appointments table...');
      await connection.query(`
        CREATE TABLE appointments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          patient_id INT NOT NULL,
          appointment_date DATE NOT NULL,
          reminder_sent BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('   ✅ Appointments table created!\n');
    } else {
      console.log('   ✅ Appointments table exists!');
      const [count] = await connection.query('SELECT COUNT(*) as count FROM appointments');
      console.log(`   📊 Records: ${count[0].count}\n`);
    }
    
    // Insert test data if empty
    const [patientCount] = await connection.query('SELECT COUNT(*) as count FROM patients');
    if (patientCount[0].count === 0) {
      console.log('4️⃣  Inserting Test Data...');
      
      await connection.query(`
        INSERT INTO patients (name, phone) VALUES
        ('Alice Smith', '9876543210'),
        ('Bob Johnson', '9988776655'),
        ('Carol White', '9123456789')
      `);
      console.log('   ✅ Inserted 3 test patients\n');
      
      const [patients] = await connection.query('SELECT id FROM patients');
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      
      await connection.query(`
        INSERT INTO appointments (patient_id, appointment_date, reminder_sent) VALUES
        (?, ?, FALSE),
        (?, ?, FALSE),
        (?, ?, FALSE)
      `, [patients[0].id, today, patients[1].id, tomorrow, patients[2].id, nextWeek]);
      
      console.log('   ✅ Inserted 3 test appointments\n');
    } else {
      console.log('4️⃣  Test Data Check...');
      console.log('   ℹ️  Data already exists, skipping insert\n');
    }
    
    // Display current data
    console.log('5️⃣  Current Data Summary:\n');
    
    const [patients] = await connection.query('SELECT * FROM patients');
    console.log('   Patients:');
    patients.forEach(p => {
      console.log(`   - ID: ${p.id}, Name: ${p.name}, Phone: ${p.phone}`);
    });
    
    console.log('');
    
    const [appointments] = await connection.query(`
      SELECT a.*, p.name as patient_name 
      FROM appointments a 
      JOIN patients p ON a.patient_id = p.id
      ORDER BY a.appointment_date DESC
    `);
    console.log('   Appointments:');
    appointments.forEach(a => {
      console.log(`   - ID: ${a.id}, Patient: ${a.patient_name}, Date: ${a.appointment_date}, Reminder Sent: ${a.reminder_sent}`);
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ DATABASE VERIFICATION COMPLETE!\n');
    console.log('🚀 You can now start the backend and frontend servers.\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:');
    console.error('   ' + error.message);
    console.error('\n💡 TROUBLESHOOTING:');
    console.error('   1. Make sure MySQL is running');
    console.error('   2. Check your .env file credentials');
    console.error('   3. Verify MySQL user has CREATE DATABASE privilege');
    console.error('   4. Try: mysql -u root -p\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkDatabase();
