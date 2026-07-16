export const getStatus = (appointmentDate, visited) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const apptDate = new Date(appointmentDate);
  apptDate.setHours(0, 0, 0, 0);

  if (visited) return 'visited';
  if (apptDate < today) return 'missed';
  if (apptDate.getTime() === today.getTime()) return 'today';
  return 'upcoming';
};
