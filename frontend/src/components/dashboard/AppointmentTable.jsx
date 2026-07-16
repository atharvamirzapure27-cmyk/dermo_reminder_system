import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle, ChevronLeft, ChevronRight, History, Phone, RefreshCw, Users } from 'lucide-react';
import Button from '../Button';
import EmptyState from './EmptyState';
import { getStatus } from '../../utils/dashboardUtils';

const AppointmentTable = ({
  isDark,
  filteredAppointments,
  appointments,
  searchTerm,
  statusFilter,
  onMarkVisited,
  onViewHistory,
  onRescheduleClick,
  sortConfig,
  onSort,
  currentPage,
  totalPages,
  onPageChange,
  totalFiltered,
}) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      visited: { color: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Visited' },
      missed: { color: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700', icon: CheckCircle, label: 'Missed' },
      today: { color: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700', icon: Calendar, label: 'Today' },
      upcoming: { color: isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700', icon: Calendar, label: 'Upcoming' },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`status-badge ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const headerClass = `text-left py-3 px-4 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const sortMark = (key) => sortConfig?.key === key ? (sortConfig.direction === 'asc' ? ' ?' : ' ?') : '';
  const SortHeader = ({ label, column }) => (
    <th className={headerClass}>
      <button onClick={() => onSort?.(column)} className="font-semibold hover:text-blue-600">
        {label}{sortMark(column)}
      </button>
    </th>
  );

  const emptyMessage = searchTerm || statusFilter !== 'All' ? 'No matching appointments found' : 'No appointments found';

  return (
    <>
      <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-blue-900'}`}>
        <Calendar className="w-6 h-6 text-blue-600" />
        Appointments
        <span className={`text-sm font-normal ${isDark ? 'text-gray-400' : 'text-blue-600'}`}>
          ({totalFiltered ?? filteredAppointments.length} of {appointments.length})
        </span>
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <SortHeader label="Patient" column="patient_name" />
              <SortHeader label="Phone" column="patient_phone" />
              <SortHeader label="Date" column="appointment_date" />
              <SortHeader label="Status" column="status" />
              <th className={headerClass}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length === 0 ? (
              <tr><td colSpan="5"><EmptyState isDark={isDark} message={emptyMessage} /></td></tr>
            ) : (
              <AnimatePresence>
                {filteredAppointments.map((apt, index) => {
                  const status = getStatus(apt.appointment_date, apt.visited);

                  return (
                    <motion.tr
                      key={apt.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.03 }}
                      className={`border-b transition-colors ${isDark ? 'border-gray-700 hover:bg-gray-700/30' : 'border-gray-100 hover:bg-blue-50/50'}`}
                    >
                      <td className={`py-4 px-4 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{apt.patient_name}</td>
                      <td className={`py-4 px-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{apt.patient_phone}</td>
                      <td className={`py-4 px-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {new Date(apt.appointment_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(status)}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2 flex-wrap">
                          <a href={`tel:${apt.patient_phone}`} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' : 'bg-green-100 text-green-700 hover:bg-green-200'}`} title={`Call ${apt.patient_name}`}>
                            <Phone className="w-4 h-4" />
                            Call
                          </a>
                          <button onClick={() => onViewHistory(apt.patient_id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`} title={`View ${apt.patient_name}'s history`}>
                            <History className="w-4 h-4" />
                            History
                          </button>
                          {status === 'today' && !apt.visited && (
                            <Button onClick={() => onMarkVisited(apt.id)} className="px-4 py-2 text-sm">
                              <CheckCircle className="w-4 h-4" />
                              Mark Visited
                            </Button>
                          )}
                          {(status === 'upcoming' || status === 'today') && (
                            <button onClick={() => onRescheduleClick(apt.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
                              <RefreshCw className="w-4 h-4" />
                              Reschedule
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Page {currentPage} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="btn-secondary disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="btn-secondary disabled:opacity-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentTable;


