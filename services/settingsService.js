const settingsRepository = require('../repositories/settingsRepository');

const getNotificationSettings = async () => {
  return settingsRepository.getSettings();
};

const updateNotificationSettings = async (settingsData) => {
  return settingsRepository.updateSettings(settingsData);
};

module.exports = {
  getNotificationSettings,
  updateNotificationSettings
};
