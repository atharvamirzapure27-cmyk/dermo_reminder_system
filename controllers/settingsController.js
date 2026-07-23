const settingsService = require('../services/settingsService');
const auditService = require('../services/auditService');

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getNotificationSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const { sms_enabled, whatsapp_enabled, voice_enabled, email_enabled } = req.body;

    const updated = await settingsService.updateNotificationSettings({
      sms_enabled: sms_enabled !== undefined ? Boolean(sms_enabled) : true,
      whatsapp_enabled: whatsapp_enabled !== undefined ? Boolean(whatsapp_enabled) : true,
      voice_enabled: voice_enabled !== undefined ? Boolean(voice_enabled) : true,
      email_enabled: email_enabled !== undefined ? Boolean(email_enabled) : false,
    });

    await auditService.log(
      req,
      'notification_settings_updated',
      `Updated notification settings: SMS=${updated.sms_enabled}, WhatsApp=${updated.whatsapp_enabled}, Voice=${updated.voice_enabled}, Email=${updated.email_enabled}`
    );

    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};
