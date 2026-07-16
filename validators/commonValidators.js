const isValidDateString = (value) => {
  if (typeof value !== 'string') {
    return false;
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsedDate = new Date(year, month - 1, day);

  return parsedDate.getFullYear() === year
    && parsedDate.getMonth() === month - 1
    && parsedDate.getDate() === day;
};

const isValidId = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

const normalizeDate = (value) => (typeof value === 'string' ? value.trim() : '');

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

module.exports = {
  isValidDateString,
  isValidId,
  normalizeDate,
  getLocalDateString
};
