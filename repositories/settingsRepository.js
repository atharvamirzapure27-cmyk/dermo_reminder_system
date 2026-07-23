const db = require('../db');

const getSettings = async () => {
  const [rows] = await db.query(
    'SELECT sms_enabled, whatsapp_enabled, voice_enabled, email_enabled, updated_at FROM notification_settings WHERE id = 1'
  );

  if (rows.length === 0) {
    return {
      sms_enabled: true,
      whatsapp_enabled: true,
      voice_enabled: true,
      email_enabled: false
    };
  }

  return {
    sms_enabled: Boolean(rows[0].sms_enabled),
    whatsapp_enabled: Boolean(rows[0].whatsapp_enabled),
    voice_enabled: Boolean(rows[0].voice_enabled),
    email_enabled: Boolean(rows[0].email_enabled),
    updated_at: rows[0].updated_at
  };
};

const updateSettings = async ({ sms_enabled, whatsapp_enabled, voice_enabled, email_enabled }) => {
  await db.query(
    `INSERT INTO notification_settings (id, sms_enabled, whatsapp_enabled, voice_enabled, email_enabled)
     VALUES (1, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
       sms_enabled = VALUES(sms_enabled),
       whatsapp_enabled = VALUES(whatsapp_enabled),
       voice_enabled = VALUES(voice_enabled),
       email_enabled = VALUES(email_enabled)`,
    [
      Boolean(sms_enabled),
      Boolean(whatsapp_enabled),
      Boolean(voice_enabled),
      Boolean(email_enabled)
    ]
  );

  return getSettings();
};

module.exports = {
  getSettings,
  updateSettings
};
