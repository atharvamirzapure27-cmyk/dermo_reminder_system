import { motion } from 'framer-motion';
import { Calendar, Users, PlusCircle, Home, Sun, Moon, Hospital } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ currentPage, setCurrentPage }) => {
  const { isDark, toggleTheme } = useTheme();
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'add-patient', label: 'Add Patient', icon: Users },
    { id: 'add-appointment', label: 'Add Appointment', icon: PlusCircle },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 px-6 py-4 border-b ${
        isDark 
          ? 'bg-gray-900/95 border-gray-700' 
          : 'bg-white/95 border-blue-100'
      } backdrop-blur-sm shadow-sm`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Side - Logo & Title */}
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
        >
          {/* Logo Icon */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-2.5 rounded-xl shadow-lg">
            <Hospital className="w-7 h-7 text-white" />
          </div>
          
          {/* Title */}
          <div className="flex flex-col">
            <h1 className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-blue-900'
            }`}>
              DERMATOLOGIST VISIT REMINDER
            </h1>
            <p className={`text-xs font-medium ${
              isDark ? 'text-gray-400' : 'text-blue-600'
            }`}>
              AVBRH Sawangi
            </p>
          </div>
        </motion.div>

        {/* Right Side - Navigation & Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : isDark 
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </motion.button>
            );
          })}
          
          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isDark 
                ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-900'
            }`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
