import { useState, useEffect } from 'react';
import { ShieldAlert, Loader2, RotateCw } from 'lucide-react';
import { getAuditLogs } from '../../services/api';
import Card from '../Card';

const AuditLogPanel = ({ isDark }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await getAuditLogs(100);
      if (response.success) {
        setLogs(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <Card>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-blue-900'}`}>
          <ShieldAlert className="w-5 h-5 text-blue-600" />
          System Audit Trail
        </h2>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className={`p-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-blue-50 text-blue-900'
          }`}
          title="Refresh Logs"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b-2 sticky top-0 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                <th className={`text-left py-2 px-3 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Timestamp</th>
                <th className={`text-left py-2 px-3 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>User</th>
                <th className={`text-left py-2 px-3 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Action</th>
                <th className={`text-left py-2 px-3 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Details</th>
                <th className={`text-left py-2 px-3 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className={`border-b text-sm ${isDark ? 'border-gray-700 hover:bg-gray-800/40' : 'border-gray-100 hover:bg-gray-50'}`}>
                  <td className={`py-3 px-3 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className={`py-3 px-3 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {log.username}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`status-badge capitalize ${
                      log.action === 'login'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : log.action.includes('failed')
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className={`py-3 px-3 max-w-xs truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`} title={log.details}>
                    {log.details}
                  </td>
                  <td className={`py-3 px-3 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {log.ip_address}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <p className="text-center py-6 text-gray-500">No logs recorded yet.</p>
          )}
        </div>
      )}
    </Card>
  );
};

export default AuditLogPanel;
