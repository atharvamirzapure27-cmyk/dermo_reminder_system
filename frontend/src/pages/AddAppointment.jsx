import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Loader2, ChevronDown, Clock } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { createAppointment, getPatients } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const DOCTORS = [
  'Dr. Priya Sharma',
  'Dr. A. K. Singh',
  'Dr. Vikram Patel'
];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM'
];

const AddAppointment = () => {
  const { isDark } = useTheme();
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_date: '',
    doctor_name: 'Dr. Priya Sharma',
    appointment_time: '10:00 AM'
  });
  const [loading, setLoading] = useState(false);
  const [fetchingPatients, setFetchingPatients] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await getPatients();
      setPatients(response.data);
    } catch (error) {
      toast.error('Failed to fetch patients');
      console.error(error);
    } finally {
      setFetchingPatients(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createAppointment({
        patient_id: parseInt(formData.patient_id),
        appointment_date: formData.appointment_date,
        doctor_name: formData.doctor_name,
        appointment_time: formData.appointment_time
      });
      toast.success('Appointment scheduled successfully!');
      setFormData({
        patient_id: '',
        appointment_date: '',
        doctor_name: 'Dr. Priya Sharma',
        appointment_time: '10:00 AM'
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create appointment');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div 
            className="bg-gradient-to-br from-blue-600 to-blue-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <Calendar className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-blue-900'}`}>
            Schedule Appointment
          </h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Select patient, doctor, and slot details
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Select */}
          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Select Patient
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                <Users className="w-5 h-5" />
              </div>
              <select
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                required
                className={`input-modern pl-10 appearance-none cursor-pointer ${isDark ? 'text-white bg-gray-800' : 'bg-white'}`}
              >
                <option value="">Choose a patient...</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.phone}
                  </option>
                ))}
              </select>
              <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Doctor Select */}
          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Consultant Doctor
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                <Users className="w-5 h-5" />
              </div>
              <select
                value={formData.doctor_name}
                onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                required
                className={`input-modern pl-10 appearance-none cursor-pointer ${isDark ? 'text-white bg-gray-800' : 'bg-white'}`}
              >
                {DOCTORS.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
              <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Input */}
            <Input
              label="Appointment Date"
              type="date"
              value={formData.appointment_date}
              onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
              icon={Calendar}
              required
              min={today}
            />

            {/* Time Slot Select */}
            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Time Slot
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                  <Clock className="w-5 h-5" />
                </div>
                <select
                  value={formData.appointment_time}
                  onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                  required
                  className={`input-modern pl-10 appearance-none cursor-pointer ${isDark ? 'text-white bg-gray-800' : 'bg-white'}`}
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Appointment...
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                Schedule Appointment
              </>
            )}
          </Button>
        </form>

        {patients.length === 0 && !fetchingPatients && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-6 p-4 border rounded-xl ${
              isDark 
                ? 'bg-yellow-900/20 border-yellow-700/30' 
                : 'bg-yellow-50 border-yellow-200'
            }`}
          >
            <p className={isDark ? 'text-yellow-300 text-sm' : 'text-yellow-800 text-sm'}>
              No patients found. Please add a patient first.
            </p>
          </motion.div>
        )}
      </Card>
    </div>
  );
};

export default AddAppointment;
