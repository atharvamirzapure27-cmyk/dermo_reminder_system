const headers = ['ID', 'Patient Name', 'Phone', 'Language', 'Appointment Date', 'Status', 'Reminder Sent', 'Missed Sent'];

const normalizeValue = (value) => {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return value ?? '';
};

const rowToArray = (row) => [
  row.id,
  row.patient_name,
  row.patient_phone,
  row.language,
  normalizeValue(row.appointment_date),
  row.status,
  row.reminder_sent ? 'Yes' : 'No',
  row.missed_sent ? 'Yes' : 'No'
];

const toCsv = (rows) => {
  const escapeCsv = (value) => `"${String(normalizeValue(value)).replace(/"/g, '""')}"`;
  return [headers, ...rows.map(rowToArray)].map((row) => row.map(escapeCsv).join(',')).join('\n');
};

const toExcel = (rows) => {
  const tableRows = [headers, ...rows.map(rowToArray)]
    .map((row) => `<tr>${row.map((cell) => `<td>${String(normalizeValue(cell)).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</td>`).join('')}</tr>`)
    .join('');

  return `<html><body><table>${tableRows}</table></body></html>`;
};

const toPdf = (rows) => {
  const content = ['Dermo Reminder System Report', '', headers.join(' | '), ...rows.map((row) => rowToArray(row).join(' | '))].join('\n');
  const escaped = content.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const stream = `BT /F1 10 Tf 40 780 Td 12 TL (${escaped.replace(/\n/g, ') Tj T* (')}) Tj ET`;
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, 'binary');
};

module.exports = {
  toCsv,
  toExcel,
  toPdf
};
