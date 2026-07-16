import { motion } from 'framer-motion';
import { Calendar, Clock, UserCheck, TrendingUp } from 'lucide-react';
import Card from '../Card';

const DashboardStats = ({ isDark, stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <Card delay={0}>
      <motion.div className="flex items-center gap-4" whileHover={{ scale: 1.02 }}>
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total</p>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-blue-900'}`}>{stats.total}</p>
        </div>
      </motion.div>
    </Card>

    <Card delay={0.1}>
      <motion.div className="flex items-center gap-4" whileHover={{ scale: 1.02 }}>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
          <Clock className="w-8 h-8 text-white" />
        </div>
        <div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Upcoming</p>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-blue-900'}`}>{stats.upcoming + stats.today}</p>
        </div>
      </motion.div>
    </Card>

    <Card delay={0.2}>
      <motion.div className="flex items-center gap-4" whileHover={{ scale: 1.02 }}>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
          <UserCheck className="w-8 h-8 text-white" />
        </div>
        <div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Visited</p>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-blue-900'}`}>{stats.visited}</p>
        </div>
      </motion.div>
    </Card>

    <Card delay={0.3}>
      <motion.div className="flex items-center gap-4" whileHover={{ scale: 1.02 }}>
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl shadow-lg">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Missed</p>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-blue-900'}`}>{stats.missed}</p>
        </div>
      </motion.div>
    </Card>
  </div>
);

export default DashboardStats;
