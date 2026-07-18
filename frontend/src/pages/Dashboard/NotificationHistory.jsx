import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, CheckCircle, AlertCircle, MessageSquare, PhoneCall, 
  MessageCircle, ChevronLeft, ChevronRight, Send, Search 
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { getNotificationsHistory, retryNotification, triggerNotificationTest } from '../../services/api';
import toast from 'react-hot-toast';

const NotificationHistory = ({ isDark }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  
  // Test Dispatch state
  const [testAptId, setTestAptId] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  // Search Filter state
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await getNotificationsHistory(page, 15);
      if (res.success) {
        setLogs(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalLogs(res.pagination.total);
      }
    } catch (err) {
      toast.error('Failed to load notification history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (logId) => {
    try {
      toast.loading('Retrying notification dispatch...', { id: 'retry-toast' });
      const res = await retryNotification(logId);
      if (res.success) {
        toast.success('Notification resent successfully!', { id: 'retry-toast' });
        fetchLogs();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend notification', { id: 'retry-toast' });
      console.error(err);
    }
  };

  const handleTriggerTest = async (e) => {
    e.preventDefault();
    if (!testAptId) {
      toast.error('Please enter a valid Appointment ID');
      return;
    }

    try {
      setSendingTest(true);
      toast.loading('Triggering manual notification test dispatches...', { id: 'test-toast' });
      const res = await triggerNotificationTest(testAptId);
      if (res.success) {
        toast.success('Test notifications dispatched successfully!', { id: 'test-toast' });
        setTestAptId('');
        fetchLogs();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch test notification', { id: 'test-toast' });
      console.error(err);
    } finally {
      setSendingTest(false);
    }
  };

  const getChannelBadge = (channel) => {
    const config = {
      sms: { label: 'SMS', icon: MessageSquare, style: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
      whatsapp_text: { label: 'WhatsApp', icon: MessageCircle, style: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
      whatsapp_voice: { label: 'Voice Call', icon: PhoneCall, style: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' }
    };
    const { label, icon: Icon, style } = config[channel] || { label: channel, icon: MessageSquare, style: 'bg-gray-100 text-gray-700' };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${style}`}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const config = {
      sent: { label: 'Sent', icon: CheckCircle, style: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
      failed: { label: 'Failed', icon: AlertCircle, style: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
      retried: { label: 'Retried', icon: RefreshCw, style: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' }
    };
    const { label, icon: Icon, style } = config[status] || { label: status, icon: AlertCircle, style: 'bg-gray-100 text-gray-700' };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${style}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  const getMessageTypeLabel = (type) => {
    const labels = {
      '3day_reminder': '3-Day Alert',
      '1day_reminder': '1-Day Alert',
      'missed_reminder': 'Missed Alert'
    };
    return labels[type] || type;
  };

  // Filter logs based on search criteria
  const filteredLogs = logs.filter(log => 
    log.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.recipient_phone.includes(searchTerm) ||
    log.message_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-blue-900'}`}>
            Notification Dispatch History
          </h2>
          <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-blue-600'}`}>
            Audit logs tracking SMS, WhatsApp text, and voice dispatches.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Dispatch Form */}
        <div className="lg:col-span-1">
          <Card isDark={isDark} className="h-full">
            <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Trigger Channel Tests
            </h3>
            <p className={`text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Enter an active Appointment ID below to trigger immediate SMS, WhatsApp text, and Voice reminder dispatches.
            </p>
            <form onSubmit={handleTriggerTest} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                  Appointment Record ID
                </label>
                <input
                  type="number"
                  placeholder="e.g. 15"
                  value={testAptId}
                  onChange={(e) => setTestAptId(e.target.value)}
                  className={`input-modern w-full ${isDark ? 'text-white bg-gray-800' : 'bg-white'}`}
                  required
                />
              </div>
              <Button type="submit" className="w-full justify-center" disabled={sendingTest}>
                <Send className="w-4 h-4 mr-2" />
                {sendingTest ? 'Sending Test...' : 'Send Test Notification'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Audit Search Filter */}
        <div className="lg:col-span-2">
          <Card isDark={isDark} className="h-full flex flex-col justify-center">
            <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Filter Logs
            </h3>
            <div className="relative">
              <Search className={`absolute left-4 top-3.5 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-blue-400'}`} />
              <input
                type="text"
                placeholder="Search by Patient Name, Phone number, or Alert type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`input-modern pl-11 pr-4 py-3 w-full ${isDark ? 'text-white bg-gray-800' : 'bg-white border-blue-100'}`}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Audit Log Table Grid */}
      <Card isDark={isDark} className="overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-blue-900'}`}>
            Total logs: {totalLogs}
          </span>
          <button
            onClick={() => { setPage(1); fetchLogs(); }}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors`}
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-blue-50 bg-blue-50/30'}`}>
                <th className={`p-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-blue-950'}`}>Patient</th>
                <th className={`p-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-blue-950'}`}>Phone</th>
                <th className={`p-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-blue-950'}`}>Channel</th>
                <th className={`p-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-blue-950'}`}>Type</th>
                <th className={`p-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-blue-950'}`}>Status</th>
                <th className={`p-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-blue-950'}`}>Details / Error</th>
                <th className={`p-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-blue-950'}`}>Sent Date</th>
                <th className={`p-4 text-xs font-bold uppercase tracking-wider text-center ${isDark ? 'text-gray-300' : 'text-blue-950'}`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading logs history...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="8" className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    No notification dispatch logs found matching parameters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className={`border-b hover:bg-gray-50/40 dark:hover:bg-gray-800/30 ${isDark ? 'border-gray-700' : 'border-blue-50'}`}>
                    <td className={`p-4 text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{log.patient_name}</td>
                    <td className={`p-4 text-sm font-mono ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{log.recipient_phone}</td>
                    <td className="p-4">{getChannelBadge(log.channel)}</td>
                    <td className={`p-4 text-xs font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getMessageTypeLabel(log.message_type)}
                    </td>
                    <td className="p-4">{getStatusBadge(log.status)}</td>
                    <td className={`p-4 text-xs max-w-[200px] truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`} title={log.error_message || log.message_text}>
                      {log.status === 'failed' ? (
                        <span className="text-red-500 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          {log.error_message || 'Dispatch failed'}
                        </span>
                      ) : (
                        log.message_text
                      )}
                    </td>
                    <td className={`p-4 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      {log.status === 'failed' ? (
                        <button
                          onClick={() => handleRetry(log.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 mx-auto transition-colors bg-amber-500 hover:bg-amber-600 text-white shadow-sm`}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Retry
                        </button>
                      ) : (
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination navigation controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-700">
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className={`p-2 rounded-lg border text-gray-500 transition-colors ${
                  isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-blue-100 hover:bg-blue-50/50'
                } disabled:opacity-50`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className={`p-2 rounded-lg border text-gray-500 transition-colors ${
                  isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-blue-100 hover:bg-blue-50/50'
                } disabled:opacity-50`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotificationHistory;
