import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import Button from '../Button';

const ReminderPanel = ({ isDark, rescheduleId, rescheduleDate, setRescheduleDate, onConfirm, onCancel }) => {
  if (!rescheduleId) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`glass-card p-6 w-full max-w-md mx-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      >
        <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Reschedule Appointment</h3>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              New Appointment Date
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`input-modern w-full ${isDark ? 'text-white' : ''}`}
              required
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={onConfirm} className="flex-1">
              <RefreshCw className="w-4 h-4" />
              Confirm Reschedule
            </Button>
            <button
              onClick={onCancel}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors ${
                isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReminderPanel;
