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
        y: -8, 
        boxShadow: isDark 
          ? '0 20px 40px rgba(0,0,0,0.4)' 
          : '0 20px 40px rgba(0,0,0,0.15)',
        scale: 1.02
      }}
      className={`glass-card p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
