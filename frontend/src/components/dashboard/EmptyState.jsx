import { Users } from 'lucide-react';

const EmptyState = ({ isDark, message }) => (
  <div className="text-center py-12">
    <Users className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
    <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{message}</p>
  </div>
);

export default EmptyState;
