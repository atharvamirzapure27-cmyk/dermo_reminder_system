import { motion } from 'framer-motion';
import { Calendar, Filter, Search, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SearchFilter = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  languageFilter = 'All',
  setLanguageFilter,
  dateFilter = '',
  setDateFilter,
}) => {
  const { isDark } = useTheme();

  const statusOptions = ['All', 'Upcoming', 'Today', 'Visited', 'Missed'];
  const languageOptions = ['All', 'english', 'hindi', 'marathi'];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 mb-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto_auto] gap-4">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Search by patient name, phone, date, status, or language..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`input-modern pl-10 pr-10 ${isDark ? 'text-white' : ''}`}
          />
          {searchTerm && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className={`w-5 h-5 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`} />
            </motion.button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`input-modern ${isDark ? 'text-white' : ''}`}>
            {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>

        <select value={languageFilter} onChange={(e) => setLanguageFilter?.(e.target.value)} className={`input-modern ${isDark ? 'text-white' : ''}`}>
          {languageOptions.map((option) => <option key={option} value={option}>{option === 'All' ? 'All Languages' : option}</option>)}
        </select>

        <div className="relative">
          <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter?.(e.target.value)}
            className={`input-modern pl-10 ${isDark ? 'text-white' : ''}`}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default SearchFilter;
