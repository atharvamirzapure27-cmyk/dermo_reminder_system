const formatDate = (value) => {
  const appointmentDate = new Date(value);
  return appointmentDate.getFullYear() + '-'
    + String(appointmentDate.getMonth() + 1).padStart(2, '0') + '-'
    + String(appointmentDate.getDate()).padStart(2, '0');
};

const getReminderMessage = (appointment) => {
  const formattedDate = formatDate(appointment.appointment_date);
  const messages = {
    english: `Hello ${appointment.patient_name}, reminder for your appointment on ${formattedDate}`,
    hindi: `Namaste ${appointment.patient_name}, ${formattedDate} ko aapki appointment ke liye reminder`,
    marathi: `Namaskar ${appointment.patient_name}, ${formattedDate} rojichya aaplya bhetisathi smaran`
  };

  return messages[appointment.language] || messages.english;
};

const getMissedMessage = (appointment) => {
  const formattedDate = formatDate(appointment.appointment_date);
  const messages = {
    english: `You have missed your appointment on ${formattedDate}. Please visit the dermatology department.`,
    hindi: `Aapki ${formattedDate} ki appointment chhoot gayi hai. Kripaya dermatology department ka daura karein.`,
    marathi: `Aapchi ${formattedDate} rojichi bhet sutali aahe. Kripaya dermatology vibhagala bhet dya.`
  };

  return messages[appointment.language] || messages.english;
};

module.exports = {
  getReminderMessage,
  getMissedMessage
};
