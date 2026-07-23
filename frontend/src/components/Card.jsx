import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const Card = ({ children, className = '', delay = 0 }) => {
  const { isDark } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      whileHover={{ 
        y: -2, 
        boxShadow: isDark 
          ? '0 12px 24px rgba(0,0,0,0.3)' 
          : '0 12px 24px rgba(0,0,0,0.08)',
        scale: 1.002
      }}
      className={`glass-card p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
