import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Loader2, ChevronDown } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { createAppointment, getPatients } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const AddAppointment = () => {
  const { isDark } = useTheme();
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_date: ''
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
        appointment_date: formData.appointment_date
      });
      toast.success('Appointment created successfully!');
      setFormData({ patient_id: '', appointment_date: '' });
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
            Select patient and appointment date
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
                className={`input-modern pl-10 appearance-none cursor-pointer ${isDark ? 'text-white' : ''}`}
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
