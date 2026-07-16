import { BarChart3, CalendarDays, Languages, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Card from '../Card';

const AnalyticsPanel = ({ analytics, isDark }) => {
  if (!analytics) {
    return null;
  }

  const { summary, monthlyTrends, languageDistribution } = analytics;
  const metrics = [
    { label: 'Total Patients', value: summary.totalPatients, icon: Users },
    { label: 'Total Appointments', value: summary.totalAppointments, icon: CalendarDays },
    { label: "Today's Appointments", value: summary.todaysAppointments, icon: CalendarDays },
    { label: "Tomorrow's Appointments", value: summary.tomorrowsAppointments, icon: CalendarDays },
    { label: 'Missed Appointments', value: summary.missedAppointments, icon: CalendarDays },
    { label: 'Reminder Success Rate', value: `${summary.reminderSuccessRate}%`, icon: BarChart3 }
  ];

  const chartColors = ['#2563eb', '#16a34a', '#f97316', '#dc2626'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{metric.label}</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-blue-900'}`}>{metric.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-blue-900'}`}>Monthly Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="month" stroke={isDark ? '#9ca3af' : '#4b5563'} />
                <YAxis stroke={isDark ? '#9ca3af' : '#4b5563'} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="appointments" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-blue-900'}`}>
            <Languages className="w-5 h-5 text-blue-600" />
            Language Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={languageDistribution} dataKey="patients" nameKey="language" outerRadius={90} label>
                  {languageDistribution.map((entry, index) => (
                    <Cell key={entry.language} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
