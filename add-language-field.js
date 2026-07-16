require('dotenv').config();
const mysql = require('mysql2/promise');

async function addLanguageField() {
  console.log('\n🔧 ADDING LANGUAGE FIELD TO PATIENTS TABLE\n');
  
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root123',
      database: process.env.DB_NAME || 'dermo_reminder_system',
    });
    
    console.log('✅ Connected to database\n');
    
    // Check if language column exists
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM patients LIKE 'language'
    `);
    
    if (columns.length === 0) {
      console.log('➕ Adding language column...');
      await connection.query(`
        ALTER TABLE patients 
        ADD COLUMN language VARCHAR(20) DEFAULT 'english' 
        AFTER phone
      `);
      console.log('✅ Language column added!\n');
    } else {
      console.log('✅ Language column already exists\n');
    }
    
    // Update existing patients with default language
    console.log('🔄 Updating existing patients...');
    await connection.query(`
      UPDATE patients 
      SET language = 'english' 
      WHERE language IS NULL OR language = ''
    `);
    console.log('✅ Existing patients updated!\n');
    
    // Display patients
    const [patients] = await connection.query('SELECT id, name, phone, language FROM patients');
    console.log('📋 Current Patients:');
    patients.forEach(p => {
      console.log(`   ID: ${p.id}, Name: ${p.name}, Phone: ${p.phone}, Language: ${p.language}`);
    });
    
    console.log('\n✅ Database upgrade complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addLanguageField();
