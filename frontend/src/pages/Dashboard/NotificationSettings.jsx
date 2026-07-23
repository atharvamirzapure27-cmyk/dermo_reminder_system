import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, MessageCircle, PhoneCall, Mail, Save, RefreshCw, Shield, AlertTriangle } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { getNotificationSettings, updateNotificationSettings } from '../../services/api';
import toast from 'react-hot-toast';

const NotificationSettings = ({ isDark }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    sms_enabled: true,
    whatsapp_enabled: true,
    voice_enabled: true,
    email_enabled: false
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getNotificationSettings();
      if (res.success) {
        setSettings({
          sms_enabled: Boolean(res.data.sms_enabled),
          whatsapp_enabled: Boolean(res.data.whatsapp_enabled),
          voice_enabled: Boolean(res.data.voice_enabled),
          email_enabled: Boolean(res.data.email_enabled)
        });
        setLastUpdated(res.data.updated_at);
      }
    } catch (err) {
      toast.error('Failed to load notification settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    if (key === 'email_enabled') {
      toast.error('Email channel is currently in preview mode and remains disabled.', { id: 'email-preview' });
      return;
    }
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      toast.loading('Saving channel settings...', { id: 'settings-toast' });
      const res = await updateNotificationSettings(settings);
      if (res.success) {
        toast.success('Notification settings saved successfully!', { id: 'settings-toast' });
        setLastUpdated(res.data.updated_at);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings', { id: 'settings-toast' });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const channels = [
    {
      key: 'sms_enabled',
      title: 'SMS Alerts',
      description: 'Direct cellular carrier SMS dispatches for 3-day, 1-day, same-day, and missed reminders.',
      icon: MessageSquare,
      color: 'from-blue-500 to-blue-600',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
    },
    {
      key: 'whatsapp_enabled',
      title: 'WhatsApp Text Messages',
      description: 'Rich text messaging via Meta WhatsApp Business Cloud API with localized multi-lingual templates.',
      icon: MessageCircle,
      color: 'from-green-500 to-emerald-600',
      badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
    },
    {
      key: 'voice_enabled',
      title: 'Interactive Voice Calls',
      description: 'Twilio Voice automated phone calls synthesizing spoken reminders in the patient’s preferred language.',
      icon: PhoneCall,
      color: 'from-purple-500 to-indigo-600',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
    },
    {
      key: 'email_enabled',
      title: 'Email Notifications (Future-Ready)',
      description: 'Hospital email dispatch integration. Disabled by default in accordance with system design.',
      icon: Mail,
      color: 'from-gray-400 to-gray-500',
      badgeColor: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      disabledBadge: 'Preview Mode'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-blue-900'}`}>
            Notification Channel Settings
          </h2>
          <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-blue-600'}`}>
            Manage active communication channels for automated patient reminder sweeps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={fetchSettings} variant="secondary" className="px-3 py-2 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Reload Settings
          </Button>
        </div>
      </div>

      {/* Info Card Banner */}
      <Card isDark={isDark} className="border-l-4 border-l-blue-600">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              System Architecture Notice
            </p>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Disabling a channel takes effect immediately across all background scheduler sweeps and manual dispatches without requiring server restarts or code changes.
            </p>
          </div>
        </div>
      </Card>

      {/* Channel Toggles List */}
      <Card isDark={isDark} className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Fetching current notification settings...
            </span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6 p-2">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {channels.map((ch) => {
                const Icon = ch.icon;
                const isEnabled = settings[ch.key];
                const isEmail = ch.key === 'email_enabled';

                return (
                  <motion.div
                    key={ch.key}
                    whileHover={{ backgroundColor: isDark ? 'rgba(31, 41, 55, 0.4)' : 'rgba(239, 246, 255, 0.4)' }}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors rounded-xl"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${ch.color} text-white shadow-md flex-shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {ch.title}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${ch.badgeColor}`}>
                            {isEmail ? ch.disabledBadge : isEnabled ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <p className={`mt-1 text-xs leading-relaxed max-w-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {ch.description}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        isEnabled && !isEmail 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {isEnabled && !isEmail ? 'Enabled' : 'Disabled'}
                      </span>
                      
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isEnabled}
                        disabled={isEmail}
                        onClick={() => handleToggle(ch.key)}
                        className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isEmail 
                            ? 'bg-gray-200 dark:bg-gray-800 cursor-not-allowed opacity-60' 
                            : isEnabled 
                            ? 'bg-green-600' 
                            : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? 'translate-x-7' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Form Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-700 px-4">
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {lastUpdated ? `Last updated: ${new Date(lastUpdated).toLocaleString()}` : ''}
              </span>

              <Button type="submit" disabled={saving} className="w-full sm:w-auto px-6 py-2.5">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving Changes...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default NotificationSettings;
