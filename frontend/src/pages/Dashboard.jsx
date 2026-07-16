import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle,
  UserCheck,
  Loader2
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { getAppointments, markVisited } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getStatus = (appointmentDate, reminderSent) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const apptDate = new Date(appointmentDate);
    apptDate.setHours(0, 0, 0, 0);

    if (reminderSent && apptDate < today) return 'visited';
    if (apptDate < today) return 'missed';
    if (apptDate.getTime() === today.getTime()) return 'today';
    return 'upcoming';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      visited: { 
        color: 'bg-green-100 text-green-700', 
        icon: CheckCircle,
        label: 'Visited' 
      },
      missed: { 
        color: 'bg-red-100 text-red-700', 
        icon: XCircle,
        label: 'Missed' 
      },
      today: { 
        color: 'bg-blue-100 text-blue-700', 
        icon: Clock,
        label: 'Today' 
      },
      upcoming: { 
        color: 'bg-purple-100 text-purple-700', 
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

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a => getStatus(a.appointment_date, a.reminder_sent) === 'upcoming').length,
    today: appointments.filter(a => getStatus(a.appointment_date, a.reminder_sent) === 'today').length,
    visited: appointments.filter(a => getStatus(a.appointment_date, a.reminder_sent) === 'visited').length,
    missed: appointments.filter(a => getStatus(a.appointment_date, a.reminder_sent) === 'missed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <Loader2 className="w-16 h-16 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card delay={0}>
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card delay={0.1}>
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-3xl font-bold text-gray-900">{stats.upcoming + stats.today}</p>
            </div>
          </div>
        </Card>

        <Card delay={0.2}>
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Visited</p>
              <p className="text-3xl font-bold text-gray-900">{stats.visited}</p>
            </div>
          </div>
        </Card>

        <Card delay={0.3}>
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-xl">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Missed</p>
              <p className="text-3xl font-bold text-gray-900">{stats.missed}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Appointments Table */}
      <Card delay={0.4}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          Recent Appointments
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Patient</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Phone</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No appointments found</p>
                  </td>
                </tr>
              ) : (
                appointments.map((apt, index) => {
                  const status = getStatus(apt.appointment_date, apt.reminder_sent);
                  
                  return (
                    <motion.tr
                      key={apt.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="py-4 px-4 font-medium text-gray-900">{apt.patient_name}</td>
                      <td className="py-4 px-4 text-gray-600">{apt.patient_phone}</td>
                      <td className="py-4 px-4 text-gray-600">
                        {new Date(apt.appointment_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(status)}</td>
                      <td className="py-4 px-4">
                        {status === 'today' && !apt.reminder_sent && (
                          <Button
                            onClick={() => handleMarkVisited(apt.id)}
                            className="px-4 py-2 text-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark Visited
                          </Button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
