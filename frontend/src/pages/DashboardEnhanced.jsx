import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock,
  XCircle,
  UserCheck,
  Loader2,
  TrendingUp,
  RefreshCw,
  Phone,
  History,
  X
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import SearchFilter from '../components/SearchFilter';
import AppointmentChart from '../components/AppointmentChart';
import { getAppointments, markVisited, rescheduleAppointment, getPatientHistory } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { isDark } = useTheme();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [historyModal, setHistoryModal] = useState(null); // patientId
  const [patientHistory, setPatientHistory] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getAppointments();
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to fetch appointments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkVisited = async (id) => {
    try {
      await markVisited(id);
      toast.success('Appointment marked as visited!');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update appointment');
      console.error(error);
    }
  };

  const handleReschedule = async (id) => {
    if (!rescheduleDate) {
      toast.error('Please select a new date');
      return;
    }

    try {
      await rescheduleAppointment(id, rescheduleDate);
      toast.success('Appointment rescheduled successfully!');
      setRescheduleId(null);
      setRescheduleDate('');
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reschedule');
      console.error(error);
    }
  };

  const getStatus = (appointmentDate, visited) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const apptDate = new Date(appointmentDate);
    apptDate.setHours(0, 0, 0, 0);

    // CORRECT LOGIC: Use visited field, not reminder_sent
    if (visited) return 'visited';
    if (apptDate < today) return 'missed';
    if (apptDate.getTime() === today.getTime()) return 'today';
    return 'upcoming';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      visited: { 
        color: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700', 
        icon: CheckCircle,
        label: 'Visited' 
      },
      missed: { 
        color: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700', 
        icon: XCircle,
        label: 'Missed' 
      },
      today: { 
        color: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700', 
        icon: Clock,
        label: 'Today' 
      },
      upcoming: { 
        color: isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700', 
        icon: Calendar,
        label: 'Upcoming' 
      },
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

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const status = getStatus(apt.appointment_date, apt.visited);
      
      const matchesSearch = 
        apt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patient_phone.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'All' || status.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, statusFilter]);

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a => getStatus(a.appointment_date, a.visited) === 'upcoming').length,
    today: appointments.filter(a => getStatus(a.appointment_date, a.visited) === 'today').length,
    visited: appointments.filter(a => getStatus(a.appointment_date, a.visited) === 'visited').length,
    missed: appointments.filter(a => getStatus(a.appointment_date, a.visited) === 'missed').length,
  };

  // Fetch patient history
  const handleViewHistory = async (patientId) => {
    try {
      const response = await getPatientHistory(patientId);
      setPatientHistory(response.data);
      setHistoryModal(patientId);
    } catch (error) {
      toast.error('Failed to fetch patient history');
      console.error('❌ Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <Loader2 className="w-16 h-16 text-blue-500" />
        </motion.div>
        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Loading appointments...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card delay={0}>
          <motion.div 
            className="flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
          >
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
          <motion.div 
            className="flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
          >
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
          <motion.div 
            className="flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
          >
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
          <motion.div 
            className="flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
          >
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

      {/* Charts */}
      <AppointmentChart appointments={appointments} />

      {/* Search & Filter */}
      <SearchFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Appointments Table */}
      <Card delay={0.4}>
        <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-blue-900'}`}>
          <Calendar className="w-6 h-6 text-blue-600" />
          Appointments
          <span className={`text-sm font-normal ${isDark ? 'text-gray-400' : 'text-blue-600'}`}>
            ({filteredAppointments.length} of {appointments.length})
          </span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Patient</th>
                <th className={`text-left py-3 px-4 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Phone</th>
                <th className={`text-left py-3 px-4 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date</th>
                <th className={`text-left py-3 px-4 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                <th className={`text-left py-3 px-4 text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Users className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {searchTerm || statusFilter !== 'All' ? 'No matching appointments found' : 'No appointments found'}
                      </p>
                    </motion.div>
                  </td>
                </tr>
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
                        transition={{ delay: index * 0.05 }}
                        className={`border-b transition-colors ${
                          isDark 
                            ? 'border-gray-700 hover:bg-gray-700/30' 
                            : 'border-gray-100 hover:bg-blue-50/50'
                        }`}
                      >
                        <td className={`py-4 px-4 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {apt.patient_name}
                        </td>
                        <td className={`py-4 px-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {apt.patient_phone}
                        </td>
                        <td className={`py-4 px-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {new Date(apt.appointment_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="py-4 px-4">{getStatusBadge(status)}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2 flex-wrap">
                            {/* Call Button - Always visible */}
                            <a
                              href={`tel:${apt.patient_phone}`}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isDark
                                  ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                              title={`Call ${apt.patient_name}`}
                            >
                              <Phone className="w-4 h-4" />
                              Call
                            </a>

                            {/* History Button - Always visible */}
                            <button
                              onClick={() => handleViewHistory(apt.patient_id)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isDark
                                  ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              }`}
                              title={`View ${apt.patient_name}'s history`}
                            >
                              <History className="w-4 h-4" />
                              History
                            </button>

                            {/* Mark Visited - Only for today */}
                            {status === 'today' && !apt.visited && (
                              <Button
                                onClick={() => handleMarkVisited(apt.id)}
                                className="px-4 py-2 text-sm"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Mark Visited
                              </Button>
                            )}

                            {/* Reschedule - Only for upcoming/today */}
                            {(status === 'upcoming' || status === 'today') && (
                              <button
                                onClick={() => {
                                  setRescheduleId(apt.id);
                                  setRescheduleDate('');
                                }}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  isDark
                                    ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50'
                                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                }`}
                              >
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
      </Card>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {rescheduleId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setRescheduleId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`glass-card p-6 w-full max-w-md mx-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
              <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Reschedule Appointment
              </h3>
              
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
                  <Button
                    onClick={() => handleReschedule(rescheduleId)}
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Confirm Reschedule
                  </Button>
                  <button
                    onClick={() => {
                      setRescheduleId(null);
                      setRescheduleDate('');
                    }}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors ${
                      isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Patient History Modal */}
      <AnimatePresence>
        {historyModal && patientHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setHistoryModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-2xl p-6 ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-2xl`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-blue-900'}`}>
                    Patient History
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {patientHistory.patient.name} • {patientHistory.patient.phone}
                  </p>
                </div>
                <button
                  onClick={() => setHistoryModal(null)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Stats */}
              <div className={`grid grid-cols-3 gap-4 mb-6 p-4 rounded-xl ${
                isDark ? 'bg-gray-700/50' : 'bg-blue-50'
              }`}>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-blue-900'}`}>
                    {patientHistory.total}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {patientHistory.appointments.filter(a => a.visited).length}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Visited</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {patientHistory.appointments.filter(a => {
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

              {/* Appointments List */}
              <div className="space-y-3">
                <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-blue-900'}`}>
                  All Appointments
                </h4>
                {patientHistory.appointments.length === 0 ? (
                  <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    No appointments found
                  </p>
                ) : (
                  patientHistory.appointments.map((appointment) => {
                    const apptStatus = getStatus(appointment.appointment_date, appointment.visited);
                    const statusColors = {
                      visited: isDark ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-green-50 text-green-700 border-green-200',
                      missed: isDark ? 'bg-red-900/30 text-red-400 border-red-700' : 'bg-red-50 text-red-700 border-red-200',
                      today: isDark ? 'bg-blue-900/30 text-blue-400 border-blue-700' : 'bg-blue-50 text-blue-700 border-blue-200',
                      upcoming: isDark ? 'bg-purple-900/30 text-purple-400 border-purple-700' : 'bg-purple-50 text-purple-700 border-purple-200',
                    };

                    return (
                      <div
                        key={appointment.id}
                        className={`p-4 rounded-xl border ${statusColors[apptStatus]}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">
                              {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-sm opacity-75 mt-1">
                              Created: {new Date(appointment.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(apptStatus)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Close Button */}
              <div className="mt-6">
                <Button
                  onClick={() => setHistoryModal(null)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
