import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Loader2, Hospital } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
  const { loginUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setLoading(true);
    try {
      await loginUser(username.trim(), password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="w-full max-w-md">
        <Card>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <motion.div 
              className="bg-gradient-to-br from-blue-600 to-blue-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              whileHover={{ rotate: 360, scale: 1.05 }}
              transition={{ duration: 0.5 }}
            >
              <Hospital className="w-8 h-8 text-white" />
            </motion.div>
            
            <h2 className="text-2xl font-extrabold text-blue-900 dark:text-white">
              AVBRH Hospital
            </h2>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">
              Dermatology Visit Reminder System
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Authorized Staff Login Only
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                icon={User}
                required
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                icon={Lock}
                required
              />
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">
            &copy; 2026 AVBRH Dermatology Department. All rights reserved.
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
