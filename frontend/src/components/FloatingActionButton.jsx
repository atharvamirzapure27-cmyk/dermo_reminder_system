import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

const FloatingActionButton = ({ onClick, icon: Icon, tooltip = 'Add' }) => {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        whileHover={{ opacity: 1, x: 0 }}
        className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-medium whitespace-nowrap"
      >
        {tooltip}
      </motion.div>

      {/* Button */}
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-shadow duration-300 group relative"
      >
        {Icon ? <Icon className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
        
        {/* Ripple effect */}
        <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20" />
      </motion.button>
    </div>
  );
};

export default FloatingActionButton;
