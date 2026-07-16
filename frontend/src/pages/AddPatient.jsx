import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Loader2, Languages } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { createPatient } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const AddPatient = () => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    language: 'english'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.trim().length > 100) return 'Name must be less than 100 characters';
    return '';
  };

  const validatePhone = (phone) => {
    const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^[6-9]\d{9}$/;
    
    if (!phone) return 'Phone number is required';
    if (!phoneRegex.test(cleanedPhone)) {
      return 'Enter a valid 10-digit Indian mobile number';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate before submit
    const nameError = validateName(formData.name);
    const phoneError = validatePhone(formData.phone);
    
    if (nameError || phoneError) {
      setErrors({ name: nameError, phone: phoneError });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await createPatient(formData);
      toast.success('Patient added successfully!');
      setFormData({ name: '', phone: '', language: 'english' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add patient');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
            <User className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-blue-900'}`}>
            Add New Patient
          </h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Fill in the patient details below
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              label="Patient Name"
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              placeholder="Enter patient name"
              icon={User}
              required
            />
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-500 flex items-center gap-1"
              >
                ⚠️ {errors.name}
              </motion.p>
            )}
          </div>

          <div>
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (errors.phone) setErrors({ ...errors, phone: '' });
              }}
              placeholder="Enter 10-digit mobile number"
              icon={Phone}
              required
            />
            {errors.phone && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-500 flex items-center gap-1"
              >
                ⚠️ {errors.phone}
              </motion.p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <Languages className="w-4 h-4 inline mr-1" />
              Preferred Language for SMS
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-blue-200 text-gray-900'
              }`}
            >
              <option value="english">English</option>
              <option value="hindi">हिंदी (Hindi)</option>
              <option value="marathi">मराठी (Marathi)</option>
            </select>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Adding Patient...
              </>
            ) : (
              <>
                <User className="w-5 h-5" />
                Add Patient
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AddPatient;
