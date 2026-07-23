require('dotenv').config();
const db = require('./db');

async function run() {
  try {
    const [patients] = await db.query(`
      SELECT id, name, phone, language FROM patients WHERE name LIKE '%Bhushan%' OR phone LIKE '%7066887353%'
    `);
    console.log('--- PATIENTS FOUND ---');
    patients.forEach(p => {
      console.log(`ID: ${p.id}, Name: ${p.name}, Phone: ${p.phone}, Lang: ${p.language}`);
    });

    const [appointments] = await db.query(`
      SELECT a.id, a.patient_id, p.name, p.phone, a.appointment_date, a.reminder_sent, a.reminder_1day_sent, a.whatsapp_status, a.voice_status
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE p.name LIKE '%Bhushan%' OR p.phone LIKE '%7066887353%'
      ORDER BY a.id DESC
    `);
    console.log('--- APPOINTMENTS FOUND ---');
    appointments.forEach(a => {
      console.log(`Appt ID: ${a.id}, Patient ID: ${a.patient_id}, Name: ${a.name}, Phone: ${a.phone}, Date: ${a.appointment_date}, SMS Sent: ${a.reminder_sent}, 1-Day: ${a.reminder_1day_sent}, WA Status: ${a.whatsapp_status}, Voice Status: ${a.voice_status}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

run();
