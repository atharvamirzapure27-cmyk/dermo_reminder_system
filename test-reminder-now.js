/**
 * Manual SMS Reminder Test
 * Triggers the actual reminder system to send real SMS in 3 languages
 * 
 * Usage: node test-reminder-now.js
 */

require('dotenv').config();
const db = require('./db');
const { sendSMS } = require('./services/twilioService');

async function testReminderNow() {
  console.log('\n🔔 Testing Manual SMS Reminder...\n');

  try {
    // Get current date in local timezone
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const localDate = `${year}-${month}-${day}`;

    console.log(`📅 Current local date: ${localDate}\n`);

    // Query for today's appointments
    const todayQuery = `
      SELECT p.name, p.phone, p.language, a.id, a.appointment_date
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.appointment_date = ?
      AND a.reminder_sent = FALSE
      AND a.visited = FALSE
    `;

    const [todayResults] = await db.query(todayQuery, [localDate]);

    if (todayResults.length === 0) {
      console.log('⚠️  No appointments found for today that need reminders.');
      console.log('\n💡 Options:');
      console.log('   1. Create an appointment for today via the frontend');
      console.log('   2. Reset reminder_sent flag on existing appointment:');
      console.log(`      UPDATE appointments SET reminder_sent = FALSE WHERE id = <appointment_id>`);
      console.log('\n📊 Current appointments in database:');
      
      // Show all appointments
      const [allAppointments] = await db.query(`
        SELECT a.id, a.appointment_date, a.reminder_sent, a.visited, p.name, p.language 
        FROM appointments a 
        JOIN patients p ON a.patient_id = p.id 
        ORDER BY a.appointment_date DESC 
        LIMIT 5
      `);
      
      console.log('\nRecent Appointments:');
      allAppointments.forEach(function(a) {
        const status = a.visited ? '✅ Visited' : (a.reminder_sent ? '📤 Reminder Sent' : '⏳ Pending');
        console.log(`  ID: ${a.id}, Patient: ${a.name}, Date: ${a.appointment_date}, Language: ${a.language}, Status: ${status}`);
      });
      console.log('\n');
      return;
    }

    console.log(`📤 Found ${todayResults.length} appointment(s) to send reminders for:\n`);

    let successCount = 0;
    let failCount = 0;

    for (const patient of todayResults) {
      // Format date nicely (YYYY-MM-DD)
      const appointmentDate = new Date(patient.appointment_date);
      const formattedDate = appointmentDate.getFullYear() + '-' + 
        String(appointmentDate.getMonth() + 1).padStart(2, '0') + '-' + 
        String(appointmentDate.getDate()).padStart(2, '0');
      
      const { get1DayReminderMessage } = require('./services/reminderMessageService');
      const message = get1DayReminderMessage({
        patient_name: patient.name,
        doctor_name: 'Dr. Priya Sharma',
        appointment_date: patient.appointment_date,
        appointment_time: '10:00 AM',
        language: patient.language
      });
      
      console.log(`📱 Patient: ${patient.name}`);
      console.log(`   Phone: ${patient.phone}`);
      console.log(`   Language: ${patient.language}`);
      console.log(`   Message: "${message}"`);
      
      try {
        const result = await sendSMS(patient.phone, message);
        
        if (result.success) {
          console.log(`   Status: ✅ SMS sent successfully!`);
          console.log(`   SID: ${result.sid}\n`);
          
          // Mark reminder as sent
          await db.query(
            'UPDATE appointments SET reminder_sent = TRUE WHERE id = ?',
            [patient.id]
          );
          
          successCount++;
        } else {
          console.log(`   Status: ❌ Failed`);
          console.log(`   Error: ${result.error}\n`);
          failCount++;
        }
      } catch (error) {
        console.log(`   Status: ❌ Exception`);
        console.log(`   Error: ${error.message}\n`);
        failCount++;
      }
    }

    console.log('─'.repeat(60));
    console.log(`🎉 Test completed: ${successCount} succeeded, ${failCount} failed\n`);

    if (successCount > 0) {
      console.log('✅ Success! Check your phone for the reminder SMS in the patient\'s language!');
      console.log('\n📝 Message Examples by Language:');
      console.log('   English: "Hello Atharva, reminder for your appointment on 2026-04-30"');
      console.log('   Hindi: "नमस्ते Atharva, 2026-04-30 को आपकी अपॉइंटमेंट के लिए अनुस्मारक"');
      console.log('   Marathi: "नमस्कार Atharva, 2026-04-30 रोजीच्या आपल्या भेटीसाठी स्मरण"');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }

  console.log('\n');
}

// Run the test
testReminderNow();
