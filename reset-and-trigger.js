require('dotenv').config();
const db = require('./db');
const { sendReminders } = require('./services/reminderService');

async function run() {
  const targetIds = [74, 75, 76];
  console.log(`🧹 Resetting reminder status for appointment IDs: ${targetIds.join(', ')}...`);

  try {
    // 1. Delete notification logs
    const [delRes] = await db.query(
      `DELETE FROM notification_logs WHERE appointment_id IN (?, ?, ?)`,
      targetIds
    );
    console.log(`🗑️ Deleted ${delRes.affectedRows} entries from notification_logs.`);

    // 2. Reset appointment status and legacy flags
    const [updRes] = await db.query(`
      UPDATE appointments 
      SET 
        reminder_sent = FALSE,
        reminder_1day_sent = FALSE,
        reminder_3day_sent = FALSE,
        status = 'scheduled',
        visited = FALSE,
        whatsapp_status = NULL,
        whatsapp_sent_at = NULL,
        whatsapp_error = NULL,
        voice_status = NULL,
        voice_sent_at = NULL,
        voice_error = NULL
      WHERE id IN (?, ?, ?)
    `, targetIds);
    console.log(`🔄 Reset ${updRes.affectedRows} appointments to 'scheduled' and unsent.`);

    // 3. Trigger immediate reminder sweep
    console.log('🚀 Executing reminder sweep with real SMS/WhatsApp/Voice dispatches...');
    const sweepResult = await sendReminders(true);
    console.log('Sweep execution result:', JSON.stringify(sweepResult, null, 2));

  } catch (error) {
    console.error('❌ Error during reset and sweep execution:', error);
  } finally {
    process.exit(0);
  }
}

run();
