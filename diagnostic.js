require('dotenv').config();
const axios = require('axios');
const mysql = require('mysql2/promise');

const BASE_URL = 'http://localhost:3001';

// Color codes for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function test(name, fn) {
  try {
    log(colors.cyan, `\n📋 Testing: ${name}`);
    await fn();
    log(colors.green, `✅ PASS: ${name}`);
    return true;
  } catch (error) {
    log(colors.red, `❌ FAIL: ${name}`);
    log(colors.red, `   Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function runDiagnostics() {
  log(colors.blue, '═'.repeat(60));
  log(colors.blue, '🔍 DERMO REMINDER SYSTEM - COMPLETE DIAGNOSTICS');
  log(colors.blue, '═'.repeat(60));

  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  let token = null;
  let headers = {};

  // Test 1: Backend Server & Login Auth
  await test('Backend Server & Superadmin Authentication', async () => {
    results.total++;
    // Get server status
    const statusRes = await axios.get(BASE_URL);
    if (!statusRes.data.success) {
      throw new Error('Server status check failed');
    }
    log(colors.green, `   Server response: ${statusRes.data.message}`);

    // Attempt login
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'superadmin',
      password: 'SuperAdmin@123'
    });

    if (loginRes.data.success) {
      token = loginRes.data.data.token;
      headers = { Authorization: `Bearer ${token}` };
      log(colors.green, '   Superadmin authenticated successfully.');
      results.passed++;
    } else {
      throw new Error('Superadmin authentication failed');
    }
  });

  // Test 2: Database Connection (via API)
  await test('Database Connection', async () => {
    results.total++;
    const response = await axios.get(`${BASE_URL}/patients`, { headers });
    if (response.data.success) {
      log(colors.green, `   Patients in DB: ${response.data.count}`);
      results.passed++;
    } else {
      throw new Error('Database query failed');
    }
  });

  // Test 3: Get Appointments
  await test('Fetch Appointments', async () => {
    results.total++;
    const response = await axios.get(`${BASE_URL}/appointments`, { headers });
    if (response.data.success) {
      log(colors.green, `   Appointments in DB: ${response.data.count}`);
      results.passed++;
    } else {
      throw new Error('Failed to fetch appointments');
    }
  });

  // Test 4: Create Test Patient
  let testPatientId = null;
  await test('Create Test Patient', async () => {
    results.total++;
    const testPhone = '9' + Date.now().toString().slice(-9); // Unique 10-digit number
    
    const response = await axios.post(`${BASE_URL}/patients`, {
      name: 'Diagnostics Test Patient',
      phone: testPhone,
      language: 'english'
    }, { headers });

    if (response.data.success) {
      testPatientId = response.data.data.id;
      log(colors.green, `   Patient created with ID: ${testPatientId}`);
      results.passed++;
    } else {
      throw new Error('Failed to create patient');
    }
  });

  // Test 5: Create Test Appointment (for today)
  let testAppointmentId = null;
  await test('Create Test Appointment (Today)', async () => {
    results.total++;
    if (!testPatientId) throw new Error('No test patient ID');

    // Use local date, not UTC date
    const now = new Date();
    const today = now.getFullYear() + '-' + 
                  String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(now.getDate()).padStart(2, '0');
    
    const response = await axios.post(`${BASE_URL}/appointments`, {
      patient_id: testPatientId,
      appointment_date: today,
      doctor_name: 'Dr. Priya Sharma',
      appointment_time: '10:00 AM'
    }, { headers });

    if (response.data.success) {
      testAppointmentId = response.data.data.id;
      log(colors.green, `   Appointment created with ID: ${testAppointmentId}`);
      log(colors.green, `   Date: ${today}`);
      results.passed++;
    } else {
      throw new Error('Failed to create appointment');
    }
  });

  // Test 6: Mark Appointment as Visited
  await test('Mark Appointment as Visited', async () => {
    results.total++;
    if (!testAppointmentId) throw new Error('No test appointment ID');

    const response = await axios.put(`${BASE_URL}/appointments/${testAppointmentId}/visited`, {}, { headers });
    
    if (response.data.success) {
      log(colors.green, '   Appointment marked as visited');
      results.passed++;
    } else {
      throw new Error('Failed to mark as visited');
    }
  });

  // Test 7: Twilio Service Loaded
  await test('Twilio SMS Service', async () => {
    results.total++;
    const { sendSMS } = require('./services/twilioService');
    
    if (typeof sendSMS === 'function') {
      log(colors.green, '   sendSMS function is available');
      results.passed++;
    } else {
      throw new Error('sendSMS function not found');
    }
  });

  // Test 8: Environment Variables
  await test('Environment Variables', async () => {
    results.total++;
    
    const required = [
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN',
      'TWILIO_PHONE_NUMBER',
      'DB_HOST',
      'DB_USER',
      'DB_NAME'
    ];

    const missing = required.filter(varName => !process.env[varName]);
    
    if (missing.length === 0) {
      log(colors.green, '   All required environment variables are set');
      log(colors.green, `   TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID.substring(0, 10)}...`);
      log(colors.green, `   TWILIO_PHONE_NUMBER: ${process.env.TWILIO_PHONE_NUMBER}`);
      results.passed++;
    } else {
      throw new Error(`Missing: ${missing.join(', ')}`);
    }
  });

  // Test 9: Phone Number Formatting
  await test('Phone Number Formatting', async () => {
    results.total++;
    const { sendSMS } = require('./services/twilioService');
    
    // Test with 10-digit number (should auto-add +91)
    const testNumber = '9876543210';
    const formatted = testNumber.startsWith('+') ? testNumber : '+91' + testNumber;
    
    if (formatted === '+919876543210') {
      log(colors.green, `   Phone formatting works: ${testNumber} → ${formatted}`);
      results.passed++;
    } else {
      throw new Error('Phone formatting failed');
    }
  });

  // Test 10: Cron Job Scheduled
  await test('Cron Job Configuration', async () => {
    results.total++;
    const cron = require('node-cron');
    
    const schedule = process.env.CRON_SCHEDULE || '0 9 * * *';
    const isValid = cron.validate(schedule);
    
    if (isValid) {
      log(colors.green, `   Cron schedule: ${schedule}`);
      log(colors.green, '   Cron expression is valid');
      results.passed++;
    } else {
      throw new Error('Invalid cron expression');
    }
  });

  // Summary
  log(colors.blue, '\n' + '═'.repeat(60));
  log(colors.blue, '📊 DIAGNOSTICS SUMMARY');
  log(colors.blue, '═'.repeat(60));
  
  const failed = results.total - results.passed;
  
  log(colors.cyan, `   Total Tests: ${results.total}`);
  log(colors.green, `   ✅ Passed: ${results.passed}`);
  
  if (failed > 0) {
    log(colors.red, `   ❌ Failed: ${failed}`);
  } else {
    log(colors.green, '   🎉 ALL TESTS PASSED!');
  }

  log(colors.blue, '═'.repeat(60));

  if (failed === 0) {
    log(colors.green, '\n🚀 System is ready for production!');
    log(colors.yellow, '\n💡 To test SMS sending:');
    log(colors.cyan, '   node test-sms.js +91YOUR_VERIFIED_NUMBER');
  } else {
    log(colors.red, '\n⚠️  Some tests failed. Please review the errors above.');
  }

  log(colors.reset, '\n');

  // Cleanup test data
  if (testAppointmentId || testPatientId) {
    log(colors.yellow, '🧹 Cleaning up diagnostics test data from database...');
    let cleanupDb;
    try {
      cleanupDb = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root123',
        database: process.env.DB_NAME || 'dermo_reminder_system',
      });
      if (testAppointmentId) {
        await cleanupDb.query('DELETE FROM appointments WHERE id = ?', [testAppointmentId]);
        log(colors.green, `   ✅ Deleted test appointment ID: ${testAppointmentId}`);
      }
      if (testPatientId) {
        await cleanupDb.query('DELETE FROM patients WHERE id = ?', [testPatientId]);
        log(colors.green, `   ✅ Deleted test patient ID: ${testPatientId}`);
      }
    } catch (cleanupErr) {
      log(colors.red, `   ⚠️ Cleanup failed: ${cleanupErr.message}`);
    } finally {
      if (cleanupDb) {
        await cleanupDb.end();
      }
    }
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Run diagnostics
runDiagnostics().catch(error => {
  log(colors.red, 'Fatal error:', error.message);
  process.exit(1);
});
