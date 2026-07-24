import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const COLOR_MAP = {
  Upcoming: { light: '#8b5cf6', dark: '#a78bfa' }, // Purple
  Today: { light: '#0ea5e9', dark: '#38bdf8' },    // Blue
  Visited: { light: '#10b981', dark: '#34d399' },  // Green
  Missed: { light: '#ef4444', dark: '#f87171' }    // Red
};

const AppointmentChart = ({ appointments, stats: passedStats }) => {
  const { isDark } = useTheme();

  const chartStats = passedStats ? {
    Upcoming: passedStats.upcoming ?? 0,
    Today: passedStats.today ?? 0,
    Visited: passedStats.visited ?? 0,
    Missed: passedStats.missed ?? 0
  } : (() => {
    const stats = {
      Upcoming: 0,
      Today: 0,
      Visited: 0,
      Missed: 0
    };

    if (appointments && Array.isArray(appointments)) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      appointments.forEach(apt => {
        const apptDate = new Date(apt.appointment_date);
        apptDate.setHours(0, 0, 0, 0);

        if (apt.visited) {
          stats.Visited++;
        } else if (apt.status === 'missed') {
          stats.Missed++;
        } else if (apptDate < today) {
          stats.Missed++;
        } else if (apptDate.getTime() === today.getTime()) {
          stats.Today++;
        } else {
          stats.Upcoming++;
        }
      });
    }
    return stats;
  })();

  const pieData = [
    { name: 'Upcoming', value: chartStats.Upcoming },
    { name: 'Today', value: chartStats.Today },
    { name: 'Visited', value: chartStats.Visited },
    { name: 'Missed', value: chartStats.Missed }
  ].filter(item => item.value > 0);

  const barData = [
    { name: 'Upcoming', count: chartStats.Upcoming },
    { name: 'Today', count: chartStats.Today },
    { name: 'Visited', count: chartStats.Visited },
    { name: 'Missed', count: chartStats.Missed }
  ];

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
                <Cell key={`cell-${index}`} fill={isDark ? COLOR_MAP[entry.name].dark : COLOR_MAP[entry.name].light} />
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
                <Cell key={`cell-${index}`} fill={isDark ? COLOR_MAP[entry.name].dark : COLOR_MAP[entry.name].light} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
};

export default AppointmentChart;
