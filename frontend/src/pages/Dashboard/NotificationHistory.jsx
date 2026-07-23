import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, CheckCircle, AlertCircle, MessageSquare, PhoneCall, 
  MessageCircle, ChevronLeft, ChevronRight, Send, Search, Filter, Calendar, ArrowUpDown
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

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Sorting state
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Test Dispatch state
  const [testAptId, setTestAptId] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [page, dateFilter, typeFilter, channelFilter, statusFilter, sortBy, sortOrder]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchLogs();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await getNotificationsHistory({
        page,
        limit: 15,
        search: searchTerm || undefined,
        date: dateFilter || undefined,
        message_type: typeFilter || undefined,
        channel: channelFilter || undefined,
        status: statusFilter || undefined,
        sortBy,
        sortOrder
      });

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

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setTypeFilter('');
    setChannelFilter('');
    setStatusFilter('');
    setSortBy('created_at');
    setSortOrder('desc');
    setPage(1);
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
    const { label, icon: Icon, style } = config[channel] || { label: channel, icon: MessageSquare, style: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${style}`}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const config = {
      sent: { label: 'Sent', icon: CheckCircle, style: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
      failed: { label: 'Failed', icon: AlertCircle, style: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
      retried: { label: 'Retried', icon: RefreshCw, style: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
      disabled: { label: 'Disabled', icon: AlertCircle, style: 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400' }
    };
    const { label, icon: Icon, style } = config[status] || { label: status, icon: AlertCircle, style: 'bg-gray-100 text-gray-700' };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${style}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  const getMessageTypeLabel = (type) => {
    const labels = {
      '3day_reminder': '3-Day Alert',
      '1day_reminder': '1-Day Alert',
      'same_day_reminder': 'Same-Day Alert',
      'missed_reminder': 'Missed Alert',
      '7day_missed_reminder': '7-Day Missed Alert'
    };
    return labels[type] || type;
  };

  const renderSortableHeader = (label, colKey) => {
    const isActive = sortBy === colKey;
    return (
      <th 
        onClick={() => handleSort(colKey)}
        className={`p-4 text-xs font-bold uppercase tracking-wider cursor-pointer select-none transition-colors ${
          isDark ? 'text-gray-300 hover:text-white' : 'text-blue-950 hover:text-blue-600'
        }`}
      >
        <div className="flex items-center gap-1">
          <span>{label}</span>
          <ArrowUpDown className={`w-3 h-3 ${isActive ? 'text-blue-500 font-extrabold' : 'opacity-40'}`} />
        </div>
      </th>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-blue-900'}`}>
            Enhanced Notification Logs
          </h2>
          <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-blue-600'}`}>
            Audit trail & logs tracking SMS, WhatsApp, and Voice dispatch attempts with multi-filter search.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => { setPage(1); fetchLogs(); }} variant="secondary" className="px-3 py-2 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Logs
          </Button>
        </div>
      </div>

      {/* Trigger Channel Tests & Filter Bar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Test Dispatch Form Card */}
        <div className="lg:col-span-1">
          <Card isDark={isDark} className="h-full flex flex-col justify-between">
            <div>
              <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Trigger Channel Test
              </h3>
              <p className={`text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Enter an active Appointment ID to dispatch test alerts across channels.
              </p>
              <form onSubmit={handleTriggerTest} className="space-y-3">
                <input
                  type="number"
                  placeholder="Appointment ID (e.g. 1)"
                  value={testAptId}
                  onChange={(e) => setTestAptId(e.target.value)}
                  className={`input-modern w-full text-xs ${isDark ? 'text-white bg-gray-800' : 'bg-white'}`}
                  required
                />
                <Button type="submit" className="w-full justify-center text-xs py-2" disabled={sendingTest}>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {sendingTest ? 'Dispatching...' : 'Dispatch Test Alert'}
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Multi-Criteria Filters Bar */}
        <div className="lg:col-span-3">
          <Card isDark={isDark} className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Filter className="w-4 h-4 text-blue-600" />
                Filter Logs
              </h3>
              <button
                onClick={handleResetFilters}
                className={`text-xs font-semibold hover:underline ${isDark ? 'text-gray-400' : 'text-blue-600'}`}
              >
                Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className={`absolute left-3 top-2.5 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-blue-400'}`} />
                <input
                  type="text"
                  placeholder="Search patient/phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`input-modern pl-9 pr-3 py-2 text-xs w-full ${isDark ? 'text-white bg-gray-800' : 'bg-white border-blue-100'}`}
                />
              </div>

              {/* Date Filter */}
              <div>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
                  className={`input-modern py-2 px-3 text-xs w-full ${isDark ? 'text-white bg-gray-800' : 'bg-white border-blue-100'}`}
                />
              </div>

              {/* Reminder Type Filter */}
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                  className={`input-modern py-2 px-3 text-xs w-full ${isDark ? 'text-white bg-gray-800' : 'bg-white border-blue-100'}`}
                >
                  <option value="">All Reminder Types</option>
                  <option value="3day_reminder">3-Day Alert</option>
                  <option value="1day_reminder">1-Day Alert</option>
                  <option value="same_day_reminder">Same-Day Alert</option>
                  <option value="missed_reminder">Missed Alert</option>
                  <option value="7day_missed_reminder">7-Day Missed Alert</option>
                </select>
              </div>

              {/* Channel Filter */}
              <div>
                <select
                  value={channelFilter}
                  onChange={(e) => { setChannelFilter(e.target.value); setPage(1); }}
                  className={`input-modern py-2 px-3 text-xs w-full ${isDark ? 'text-white bg-gray-800' : 'bg-white border-blue-100'}`}
                >
                  <option value="">All Channels</option>
                  <option value="sms">SMS</option>
                  <option value="whatsapp_text">WhatsApp</option>
                  <option value="whatsapp_voice">Voice Call</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className={`input-modern py-2 px-3 text-xs w-full ${isDark ? 'text-white bg-gray-800' : 'bg-white border-blue-100'}`}
                >
                  <option value="">All Statuses</option>
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                  <option value="retried">Retried</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Enhanced Audit Log Table Grid */}
      <Card isDark={isDark} className="overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-blue-900'}`}>
            Total Logs Found: {totalLogs}
          </span>
          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Click headers to sort table
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-blue-50 bg-blue-50/30'}`}>
                {renderSortableHeader('Patient Name', 'patient_name')}
                {renderSortableHeader('Phone Number', 'recipient_phone')}
                {renderSortableHeader('Appt Date', 'appointment_date')}
                {renderSortableHeader('Reminder Type', 'message_type')}
                {renderSortableHeader('Channel', 'channel')}
                {renderSortableHeader('Status', 'status')}
                <th className={`p-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-blue-950'}`}>Details / Error</th>
                {renderSortableHeader('Sent Date & Time', 'created_at')}
                <th className={`p-4 text-xs font-bold uppercase tracking-wider text-center ${isDark ? 'text-gray-300' : 'text-blue-950'}`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading notification history...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="9" className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    No notification logs found matching selected criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className={`border-b hover:bg-gray-50/40 dark:hover:bg-gray-800/30 ${isDark ? 'border-gray-700' : 'border-blue-50'}`}>
                    <td className={`p-4 text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{log.patient_name}</td>
                    <td className={`p-4 text-xs font-mono ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{log.recipient_phone}</td>
                    <td className={`p-4 text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {log.appointment_date ? new Date(log.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                    </td>
                    <td className={`p-4 text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {getMessageTypeLabel(log.message_type)}
                    </td>
                    <td className="p-4">{getChannelBadge(log.channel)}</td>
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
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 mx-auto transition-colors bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                        >
                          <RefreshCw className="w-3 h-3" />
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

        {/* Pagination Navigation */}
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
