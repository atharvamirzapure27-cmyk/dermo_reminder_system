require('dotenv').config();
const db = require('../db');

const indexes = [
  { table: 'patients', name: 'idx_patients_name', sql: 'CREATE INDEX idx_patients_name ON patients (name)' },
  { table: 'patients', name: 'idx_patients_language', sql: 'CREATE INDEX idx_patients_language ON patients (language)' },
  { table: 'appointments', name: 'idx_appointments_date', sql: 'CREATE INDEX idx_appointments_date ON appointments (appointment_date)' },
  { table: 'appointments', name: 'idx_appointments_patient_date', sql: 'CREATE INDEX idx_appointments_patient_date ON appointments (patient_id, appointment_date)' },
  { table: 'appointments', name: 'idx_appointments_reminder_due', sql: 'CREATE INDEX idx_appointments_reminder_due ON appointments (appointment_date, reminder_sent, visited)' },
  { table: 'appointments', name: 'idx_appointments_missed_due', sql: 'CREATE INDEX idx_appointments_missed_due ON appointments (appointment_date, visited, missed_sent)' }
];

const indexExists = async (table, name) => {
  const [rows] = await db.query(`
    SELECT 1
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
    AND table_name = ?
    AND index_name = ?
    LIMIT 1
  `, [table, name]);

  return rows.length > 0;
};

const addSafeIndexes = async () => {
  try {
    for (const index of indexes) {
      if (await indexExists(index.table, index.name)) {
        console.log(`Index exists: ${index.name}`);
        continue;
      }

      await db.query(index.sql);
      console.log(`Index created: ${index.name}`);
    }
  } finally {
    await db.end();
  }
};

addSafeIndexes().catch((error) => {
  console.error('Failed to add indexes:', error.message);
  process.exit(1);
});
