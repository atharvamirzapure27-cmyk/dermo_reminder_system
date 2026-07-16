import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const COLORS = {
  light: ['#0ea5e9', '#8b5cf6', '#10b981', '#ef4444'],
  dark: ['#38bdf8', '#a78bfa', '#34d399', '#f87171']
};

const AppointmentChart = ({ appointments }) => {
  const { isDark } = useTheme();

  const getStatus = (appointmentDate, reminderSent) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const apptDate = new Date(appointmentDate);
    apptDate.setHours(0, 0, 0, 0);

    if (reminderSent && apptDate < today) return 'Visited';
    if (apptDate < today) return 'Missed';
    if (apptDate.getTime() === today.getTime()) return 'Today';
    return 'Upcoming';
  };

  const stats = {
    Upcoming: 0,
    Today: 0,
    Visited: 0,
    Missed: 0
  };

  appointments.forEach(apt => {
    const status = getStatus(apt.appointment_date, apt.reminder_sent);
    stats[status]++;
  });

  const pieData = [
    { name: 'Upcoming', value: stats.Upcoming },
    { name: 'Today', value: stats.Today },
    { name: 'Visited', value: stats.Visited },
    { name: 'Missed', value: stats.Missed }
  ].filter(item => item.value > 0);

  const barData = [
    { name: 'Upcoming', count: stats.Upcoming },
    { name: 'Today', count: stats.Today },
    { name: 'Visited', count: stats.Visited },
    { name: 'Missed', count: stats.Missed }
  ];

  const colors = isDark ? COLORS.dark : COLORS.light;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {/* Pie Chart */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="glass-card p-6"
      >
        <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Appointment Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              animationBegin={200}
              animationDuration={800}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#fff',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                color: isDark ? '#fff' : '#000'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bar Chart */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="glass-card p-6"
      >
        <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Appointment Summary
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
            <XAxis 
              dataKey="name" 
              stroke={isDark ? '#9ca3af' : '#6b7280'}
            />
            <YAxis 
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#fff',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                color: isDark ? '#fff' : '#000'
              }}
            />
            <Bar 
              dataKey="count" 
              animationBegin={200}
              animationDuration={800}
            >
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
};

export default AppointmentChart;
