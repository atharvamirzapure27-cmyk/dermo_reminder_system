const headers = ['ID', 'Patient Name', 'Phone', 'Language', 'Date', 'Status', 'SMS Status', 'WhatsApp Status', 'Voice Status'];

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
  row.sms_status || (row.reminder_sent ? 'Sent' : 'Pending'),
  row.whatsapp_status || 'Pending',
  row.voice_status || 'Pending'
];

/**
 * Compile data rows into clean CSV
 */
const toCsv = (rows) => {
  const escapeCsv = (value) => `"${String(normalizeValue(value)).replace(/"/g, '""')}"`;
  return [headers, ...rows.map(rowToArray)]
    .map((row) => row.map(escapeCsv).join(','))
    .join('\n');
};

/**
 * Compile data rows into a styled HTML-compatible Excel sheet with forced text phone cells
 */
const toExcel = (rows, title = 'Dermatology Report') => {
  const tableHeader = `
    <tr style="background-color: #1e3a8a; color: #ffffff; font-weight: bold; font-family: sans-serif;">
      ${headers.map(h => `<th style="padding: 10px; border: 1px solid #cbd5e1; font-size: 12px; text-align: left;">${h}</th>`).join('')}
    </tr>
  `;
  const tableRows = rows.map((row, idx) => {
    const arr = rowToArray(row);
    const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    return `
      <tr style="background-color: ${bg}; font-family: sans-serif; font-size: 11px;">
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${arr[0]}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">${arr[1]}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; mso-number-format:'\\@';">${arr[2]}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-transform: uppercase;">${arr[3]}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${arr[4]}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; text-transform: capitalize;">${arr[5]}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${arr[6]}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${arr[7]}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${arr[8]}</td>
      </tr>
    `;
  }).join('');

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>${title.slice(0, 31)}</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
    </head>
    <body style="margin: 0; padding: 20px; font-family: sans-serif;">
      <div style="margin-bottom: 20px;">
        <h2 style="color: #1e3a8a; margin: 0; font-size: 20px;">Acharya Vinoba Bhave Rural Hospital</h2>
        <p style="color: #475569; margin: 5px 0 0 0; font-size: 12px; font-weight: bold;">Dermatology Department | System Name: Dermatology Reminder System</p>
        <p style="color: #64748b; margin: 2px 0 20px 0; font-size: 11px;">Generated Date: ${new Date().toLocaleString()} | Department: Dermatology</p>
      </div>
      <table style="border-collapse: collapse; width: 100%; border: 1px solid #cbd5e1;">
        <thead>${tableHeader}</thead>
        <tbody>${tableRows}</tbody>
      </table>
      <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 10px; color: #94a3b8; text-align: center;">
        Dermatology Appointment Alerts & Reports System - AVBRH Hospital Footer
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate beautifully styled PDF layout using PDF-1.4 spec drawing grids, margins, branding titles, and page headers manually
 */
const toPdf = (rows, title = 'Dermatology Report') => {
  const escapePdfStr = (str) => String(str || '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

  // Compile PDF drawing stream commands
  let stream = '';

  // Draw Top Letterhead Section
  stream += '0.078 0.165 0.380 rg\n'; // Primary Color (Dark Blue)
  stream += '30 735 552 4 re f\n';    // Solid Blue Accent Rule
  
  stream += 'BT\n';
  stream += '/F2 15 Tf\n'; // Helvetica-Bold 15pt
  stream += '0.078 0.165 0.380 rg\n';
  stream += '30 750 Td\n';
  stream += '(ACHARYA VINOBA BHAVE RURAL HOSPITAL) Tj\n';
  stream += 'ET\n';

  stream += 'BT\n';
  stream += '/F1 10 Tf\n'; // Helvetica 10pt
  stream += '0.28 0.33 0.41 rg\n'; // Secondary Color (Slate Gray)
  stream += '30 720 Td\n';
  stream += `(Dermatology Department | System Name: Dermatology Reminder System) Tj\n`;
  stream += 'ET\n';

  stream += 'BT\n';
  stream += '/F1 8 Tf\n';
  stream += '30 705 Td\n';
  stream += `(Generated Date: ${escapePdfStr(new Date().toLocaleString())} | Department: Dermatology | Generated By: System Administrator) Tj\n`;
  stream += 'ET\n';

  // Draw Title Header Banner
  stream += '0.94 0.96 0.98 rg\n'; // Light Slate Background
  stream += '30 670 552 25 re f\n';
  
  stream += 'BT\n';
  stream += '/F2 11 Tf\n';
  stream += '0.078 0.165 0.380 rg\n';
  stream += '40 678 Td\n';
  stream += `(${escapePdfStr(title.toUpperCase())} - APPOINTMENT REMINDERS SUMMARY) Tj\n`;
  stream += 'ET\n';

  // Setup Column Offsets & Widths (Total Width: 552)
  const colOffsets = [30, 55, 150, 220, 270, 335, 395, 455, 520];
  const colWidths = [25, 95, 70, 50, 65, 60, 60, 65, 52];

  // Draw Table Headers Background
  stream += '0.117 0.227 0.541 rg\n'; // Dark Blue Header Bg
  stream += '30 635 552 20 re f\n';

  // Write Table Headers Text
  stream += 'BT\n';
  stream += '/F2 8 Tf\n';
  stream += '1 1 1 rg\n'; // White text
  
  headers.forEach((h, index) => {
    const x = colOffsets[index] + 4;
    stream += `${x} 641 Td (${escapePdfStr(h)}) Tj\n`;
    // Reset cursor for next column relative to bottom-left origin
    stream += `-${x} -641 Td\n`;
  });
  stream += 'ET\n';

  // Draw Data Rows
  let y = 615;
  const rowHeight = 18;

  rows.forEach((row, rowIndex) => {
    const values = rowToArray(row);

    // Alternate Row Shading
    if (rowIndex % 2 !== 0) {
      stream += '0.969 0.976 0.988 rg\n'; // Off-White
      stream += `30 ${y} 552 ${rowHeight} re f\n`;
    }

    // Grid row border line (thin light gray)
    stream += '0.88 0.89 0.92 RG\n'; // stroke color
    stream += '0.5 w\n'; // line width
    stream += `30 ${y} m 582 ${y} l S\n`;

    // Write Row Text Cells
    stream += 'BT\n';
    stream += '/F1 7.5 Tf\n';
    stream += '0.15 0.15 0.15 rg\n'; // Dark Charcoal Text

    values.forEach((val, colIndex) => {
      const cellText = escapePdfStr(val);
      const x = colOffsets[colIndex] + 4;
      const cellY = y + 5;
      stream += `${x} ${cellY} Td (${cellText}) Tj\n`;
      // Reset cursor
      stream += `-${x} -${cellY} Td\n`;
    });
    stream += 'ET\n';

    y -= rowHeight;
  });

  // Draw professional footer
  stream += '0.88 0.89 0.92 RG\n';
  stream += '30 40 m 582 40 l S\n'; // horizontal rule

  stream += 'BT\n';
  stream += '/F1 7 Tf\n';
  stream += '0.58 0.62 0.69 rg\n';
  stream += '30 28 Td\n';
  stream += '(Copyright Acharya Vinoba Bhave Rural Hospital - Dermatology Department | Confidentiality Asserted) Tj\n';
  stream += 'ET\n';

  stream += 'BT\n';
  stream += '/F2 7 Tf\n';
  stream += '530 28 Td\n';
  stream += '(Page 1 of 1) Tj\n';
  stream += 'ET\n';

  const contentStream = `BT /F1 10 Tf ET\n${stream}`;

  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj',
    `6 0 obj << /Length ${contentStream.length} >> stream\n${contentStream}\nendstream endobj`
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
