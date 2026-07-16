import { Download, FileSpreadsheet } from 'lucide-react';
import Card from '../Card';

const reportTypes = [
  { value: 'daily', label: 'Daily Report' },
  { value: 'weekly', label: 'Weekly Report' },
  { value: 'monthly', label: 'Monthly Report' },
  { value: 'missed', label: 'Missed Appointment Report' },
  { value: 'reminders', label: 'Reminder Report' }
];

const formats = [
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' },
  { value: 'csv', label: 'CSV' }
];

const ReportPanel = ({ isDark, reportType, setReportType, report, onExport }) => (
  <Card>
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
      <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-blue-900'}`}>
        <FileSpreadsheet className="w-5 h-5 text-blue-600" />
        Reports
      </h2>

      <div className="flex flex-col sm:flex-row gap-3">
        <select value={reportType} onChange={(event) => setReportType(event.target.value)} className={`input-modern ${isDark ? 'text-white' : ''}`}>
          {reportTypes.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        <div className="flex gap-2">
          {formats.map((format) => (
            <button
              key={format.value}
              onClick={() => onExport(format.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                isDark ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <Download className="w-4 h-4" />
              {format.label}
            </button>
          ))}
        </div>
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className={`border-b-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <th className={`text-left py-2 px-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Patient</th>
            <th className={`text-left py-2 px-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Phone</th>
            <th className={`text-left py-2 px-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date</th>
            <th className={`text-left py-2 px-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
          </tr>
        </thead>
        <tbody>
          {(report?.data || []).slice(0, 5).map((row) => (
            <tr key={row.id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <td className={`py-2 px-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{row.patient_name}</td>
              <td className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{row.patient_phone}</td>
              <td className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{new Date(row.appointment_date).toLocaleDateString()}</td>
              <td className={`py-2 px-3 capitalize ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {report?.count === 0 && <p className={`py-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No rows for this report</p>}
    </div>
  </Card>
);

export default ReportPanel;
