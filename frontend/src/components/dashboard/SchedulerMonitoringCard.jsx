import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Clock, CheckCircle2, AlertTriangle, XCircle, 
  RefreshCw, Radio, MessageSquare, MessageCircle, PhoneCall, Zap, Calendar
} from 'lucide-react';
import Card from '../Card';
import { getSchedulerStatus } from '../../services/api';

const SchedulerMonitoringCard = ({ isDark }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await getSchedulerStatus();
      if (res.success) {
        setData(res.data);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch scheduler status:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'running') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Scheduler Running
        </span>
      );
    }
    if (status === 'error') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
          <XCircle className="w-3.5 h-3.5" />
          Execution Error
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
        <AlertTriangle className="w-3.5 h-3.5" />
        Stopped / Idle
      </span>
    );
  };

  if (loading && !data) {
    return (
      <Card isDark={isDark} className="p-6">
        <div className="flex items-center justify-center gap-2 py-8">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Connecting to Scheduler Service...
          </span>
        </div>
      </Card>
    );
  }

  const isStoppedOrError = data?.status === 'error' || data?.status === 'stopped';

  return (
    <Card isDark={isDark} className="relative overflow-hidden">
      {/* Top Warning Banner if Scheduler Stopped unexpectedly */}
      {isStoppedOrError && (
        <div className="bg-red-500 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md mb-4 -mx-6 -mt-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>WARNING: Automated Scheduler has stopped unexpectedly or encountered an error.</span>
          </div>
          <button 
            onClick={fetchStatus}
            className="underline hover:text-red-100 font-extrabold"
          >
            Check Status
          </button>
        </div>
      )}

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-blue-900'}`}>
                Scheduler Monitoring Engine
              </h3>
              {data && getStatusBadge(data.status)}
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Real-time telemetry & background cron execution status
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Auto-refreshed: {lastRefreshed.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchStatus}
            className={`p-1.5 rounded-lg border text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
            title="Force refresh status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Processed Today */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-blue-50/50 border-blue-100'}`}>
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Processed Today</span>
            <Zap className="w-4 h-4 text-blue-500" />
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-blue-900'}`}>
            {data?.processedToday ?? 0}
          </div>
        </div>

        {/* Sent Today */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-green-50/50 border-green-100'}`}>
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Sent Today</span>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-green-400' : 'text-green-700'}`}>
            {data?.sentToday ?? 0}
          </div>
        </div>

        {/* Failed Today */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-red-50/50 border-red-100'}`}>
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Failed Today</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-red-400' : 'text-red-700'}`}>
            {data?.failedToday ?? 0}
          </div>
        </div>

        {/* Pending Reminders */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-amber-50/50 border-amber-100'}`}>
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Pending Sweeps</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
            {data?.pendingReminders ?? 0}
          </div>
        </div>
      </div>

      {/* System Execution & Channel Health Footer */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Left: Execution Specs */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Last Execution:</span>
            <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {data?.lastRun ? new Date(data.lastRun).toLocaleString() : 'Pending first scan'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Next Scheduled Run:</span>
            <span className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
              {data?.nextRun ? new Date(data.nextRun).toLocaleTimeString() : '-'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Last Run Duration:</span>
            <span className={`font-mono font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {data?.lastDurationMs ? `${data.lastDurationMs} ms` : '< 100 ms'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>CRON Schedule:</span>
            <span className={`font-mono px-2 py-0.5 rounded text-[11px] font-bold ${
              isDark ? 'bg-gray-800 text-gray-300 border border-gray-700' : 'bg-gray-100 text-gray-800'
            }`}>
              {data?.cronSchedule || '*/30 * * * *'}
            </span>
          </div>
        </div>

        {/* Right: Active Channel Health */}
        <div className="space-y-2">
          <span className={`block font-bold uppercase tracking-wider text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Channel Health Status
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            {/* SMS Badge */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
              data?.channels?.sms 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 line-through'
            }`}>
              <MessageSquare className="w-3.5 h-3.5" />
              SMS: {data?.channels?.sms ? 'Active' : 'Off'}
            </span>

            {/* WhatsApp Badge */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
              data?.channels?.whatsapp
                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 line-through'
            }`}>
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp: {data?.channels?.whatsapp ? 'Active' : 'Off'}
            </span>

            {/* Voice Badge */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
              data?.channels?.voice
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 line-through'
            }`}>
              <PhoneCall className="w-3.5 h-3.5" />
              Voice: {data?.channels?.voice ? 'Active' : 'Off'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SchedulerMonitoringCard;
