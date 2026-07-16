import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from '../Button';
import { getStatus } from '../../utils/dashboardUtils';

const HistoryModal = ({ isDark, historyModal, patientHistory, onClose }) => {
  if (!historyModal || !patientHistory) return null;

  const getStatusBadge = (status) => {
    const statusConfig = {
      visited: {
        color: isDark ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-green-50 text-green-700 border-green-200',
        label: 'Visited',
      },
      missed: {
        color: isDark ? 'bg-red-900/30 text-red-400 border-red-700' : 'bg-red-50 text-red-700 border-red-200',
        label: 'Missed',
      },
      today: {
        color: isDark ? 'bg-blue-900/30 text-blue-400 border-blue-700' : 'bg-blue-50 text-blue-700 border-blue-200',
        label: 'Today',
      },
      upcoming: {
        color: isDark ? 'bg-purple-900/30 text-purple-400 border-purple-700' : 'bg-purple-50 text-purple-700 border-purple-200',
        label: 'Upcoming',
      },
    };

    const config = statusConfig[status];
    return <span className={`px-3 py-1 rounded-full border text-sm font-medium ${config.color}`}>{config.label}</span>;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-blue-900'}`}>Patient History</h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {patientHistory.patient.name} • {patientHistory.patient.phone}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className={`grid grid-cols-3 gap-4 mb-6 p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
            <div className="text-center">
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-blue-900'}`}>{patientHistory.total}</p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{patientHistory.appointments.filter((a) => a.visited).length}</p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Visited</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {patientHistory.appointments.filter((a) => {
                  const apptDate = new Date(a.appointment_date);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  apptDate.setHours(0, 0, 0, 0);
                  return apptDate < today && !a.visited;
                }).length}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Missed</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-blue-900'}`}>All Appointments</h4>
            {patientHistory.appointments.length === 0 ? (
              <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No appointments found</p>
            ) : (
              patientHistory.appointments.map((appointment) => {
                const apptStatus = getStatus(appointment.appointment_date, appointment.visited);

                return (
                  <div key={appointment.id} className={`p-4 rounded-xl border ${isDark ? 'bg-gray-700/40 border-gray-600' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm opacity-75 mt-1">
                          Created: {new Date(appointment.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">{getStatusBadge(apptStatus)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6">
            <Button onClick={onClose} className="w-full">Close</Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HistoryModal;
