const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  icon: Icon,
  required = false,
  min
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          className={`input-modern ${Icon ? 'pl-10' : ''} dark:bg-gray-800 dark:text-white dark:border-gray-700`}
        />
      </div>
    </div>
  );
};

export default Input;
