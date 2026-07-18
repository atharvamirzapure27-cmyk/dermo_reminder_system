import { BarChart3, CalendarDays, Languages, Users, Download, HelpCircle } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Card from '../Card';
import { API_URL } from '../../services/api';

const AnalyticsPanel = ({ analytics, isDark }) => {
  if (!analytics) {
    return null;
  }

  const { summary, monthlyTrends, languageDistribution, doctorStats, departmentStats } = analytics;

  // Overall grid cards for metrics (Part 2: Summary Metrics)
  const metrics = [
    { label: 'Total Patients', value: summary.totalPatients, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Appointments', value: summary.totalAppointments, icon: CalendarDays, color: 'bg-indigo-500' },
    { label: "Today's Appointments", value: summary.todaysAppointments, icon: CalendarDays, color: 'bg-emerald-500' },
    { label: "Weekly Appointments", value: summary.weeklyAppointments, icon: CalendarDays, color: 'bg-amber-500' },
    { label: "Monthly Appointments", value: summary.monthlyAppointments, icon: CalendarDays, color: 'bg-purple-500' },
    { label: 'Visited Patients', value: summary.visitedAppointments || 0, icon: Users, color: 'bg-teal-500' },
    { label: 'Missed Appointments', value: summary.missedAppointments || 0, icon: Users, color: 'bg-rose-500' },
    { label: 'Cancelled Schedules', value: summary.cancelledAppointments || 0, icon: Users, color: 'bg-gray-500' }
  ];

  // Channel Dispatches Progress Bars
  const channelStats = [
    { label: 'Overall Dispatch Rate', value: summary.reminderSuccessRate, color: 'bg-indigo-600' },
    { label: 'SMS Delivery Rate', value: summary.smsSuccessRate, color: 'bg-blue-600' },
    { label: 'WhatsApp Text Rate', value: summary.whatsappSuccessRate, color: 'bg-green-600' },
    { label: 'Voice Call Rate', value: summary.voiceSuccessRate, color: 'bg-purple-600' }
  ];

  const chartColors = ['#2563eb', '#16a34a', '#f97316', '#dc2626', '#8b5cf6', '#0d9488'];

  const handleExportAnalytics = () => {
    window.open(`${API_URL}/analytics/export`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Analytics Title Header and Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-blue-900'}`}>
            Operational Reports & Insights
          </h3>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Detailed summary and performance indices of channels delivery rates.
          </p>
        </div>
        <button
          onClick={handleExportAnalytics}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition-colors w-full sm:w-auto"
        >
          <Download className="w-4 h-4" />
          Export Insights (CSV)
        </button>
      </div>

      {/* Basic Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="p-3">
              <div className="flex flex-col gap-2">
                <div className={`${metric.color} p-1.5 rounded-lg w-fit`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {metric.label}
                  </p>
                  <p className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-blue-950'}`}>
                    {metric.value}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Channels success rate meters */}
      <Card>
        <h4 className={`font-bold text-sm mb-4 ${isDark ? 'text-white' : 'text-blue-900'}`}>
          Communication Channels Delivery Success
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {channelStats.map((channel) => (
            <div key={channel.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{channel.label}</span>
                <span className={isDark ? 'text-white' : 'text-blue-900'}>{channel.value}%</span>
              </div>
              <div className={`h-2 rounded-full w-full ${isDark ? 'bg-gray-700' : 'bg-gray-150'}`}>
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${channel.color}`}
                  style={{ width: `${channel.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Graphical Trends & Lang Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h4 className={`font-bold text-sm mb-4 ${isDark ? 'text-white' : 'text-blue-900'}`}>
            Monthly Schedule Volume
          </h4>
          <div className="h-60">
            {monthlyTrends && monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="month" stroke={isDark ? '#9ca3af' : '#4b5563'} style={{ fontSize: '10px' }} />
                  <YAxis stroke={isDark ? '#9ca3af' : '#4b5563'} allowDecimals={false} style={{ fontSize: '10px' }} />
                  <Tooltip />
                  <Bar dataKey="appointments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-500">No trend data available</div>
            )}
          </div>
        </Card>

        <Card>
          <h4 className={`font-bold text-sm mb-4 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-blue-900'}`}>
            <Languages className="w-4 h-4 text-blue-600" />
            Patient Language Preference
          </h4>
          <div className="h-60 flex items-center justify-center">
            {languageDistribution && languageDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={languageDistribution} dataKey="patients" nameKey="language" outerRadius={75} label>
                    {languageDistribution.map((entry, index) => (
                      <Cell key={entry.language} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-500">No language data available</div>
            )}
          </div>
        </Card>
      </div>

      {/* Doctors & Department Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Doctor Stats Table (Part 2: Doctor-wise Statistics) */}
        <Card className="lg:col-span-2">
          <h4 className={`font-bold text-sm mb-3 ${isDark ? 'text-white' : 'text-blue-900'}`}>
            Consultant Doctor Schedules & Statuses
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-100 text-gray-600'} font-semibold`}>
                  <th className="pb-2">Consultant Doctor</th>
                  <th className="pb-2 text-center">Total Schedules</th>
                  <th className="pb-2 text-center">Visited</th>
                  <th className="pb-2 text-center">Missed</th>
                  <th className="pb-2 text-center">Cancelled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {!doctorStats || doctorStats.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-500">No doctor statistics logged</td>
                  </tr>
                ) : (
                  doctorStats.map((doc) => (
                    <tr key={doc.doctor_name} className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      <td className="py-2.5 font-bold">{doc.doctor_name}</td>
                      <td className="py-2.5 text-center font-semibold text-blue-600 dark:text-blue-400">{doc.total}</td>
                      <td className="py-2.5 text-center text-emerald-600 font-medium">{doc.visited}</td>
                      <td className="py-2.5 text-center text-rose-500 font-medium">{doc.missed}</td>
                      <td className="py-2.5 text-center text-gray-500">{doc.cancelled}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Department Stats Table */}
        <Card className="lg:col-span-1">
          <h4 className={`font-bold text-sm mb-3 ${isDark ? 'text-white' : 'text-blue-900'}`}>
            Schedules by Department
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-100 text-gray-600'} font-semibold`}>
                  <th className="pb-2">Clinical Department</th>
                  <th className="pb-2 text-right">Total Scheduled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {!departmentStats || departmentStats.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="py-4 text-center text-gray-500">No department statistics logged</td>
                  </tr>
                ) : (
                  departmentStats.map((dept) => (
                    <tr key={dept.department} className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      <td className="py-2.5 font-medium">{dept.department}</td>
                      <td className="py-2.5 text-right font-bold text-indigo-600 dark:text-indigo-400">{dept.total}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
