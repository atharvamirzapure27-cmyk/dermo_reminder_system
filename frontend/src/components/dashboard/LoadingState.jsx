import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const LoadingState = ({ isDark }) => (
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

export default LoadingState;
