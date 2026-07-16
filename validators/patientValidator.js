const VALID_LANGUAGES = ['english', 'hindi', 'marathi'];

const validateCreatePatient = (body) => {
  const { name, phone, language } = body;
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  const normalizedPhone = typeof phone === 'string' ? phone.trim() : '';

  if (!trimmedName || !normalizedPhone) {
    return { valid: false, status: 400, message: 'Name and phone are required' };
  }

  if (trimmedName.length < 2 || trimmedName.length > 100) {
    return { valid: false, status: 400, message: 'Name must be between 2 and 100 characters' };
  }

  const cleanedPhone = normalizedPhone.replace(/[\s\-\(\)]/g, '');
  const phoneRegex = /^[6-9]\d{9}$/;

  if (!phoneRegex.test(cleanedPhone)) {
    return {
      valid: false,
      status: 400,
      message: 'Invalid phone number. Enter a valid 10-digit Indian mobile number'
    };
  }

  return {
    valid: true,
    data: {
      name: trimmedName,
      phone: cleanedPhone,
      language: VALID_LANGUAGES.includes(language) ? language : 'english'
    }
  };
};

module.exports = { validateCreatePatient, VALID_LANGUAGES };
