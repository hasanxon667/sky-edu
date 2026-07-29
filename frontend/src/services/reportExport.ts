import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { AttendanceRecord } from '../types';

export function exportToPDF(records: AttendanceRecord[], title: string = "Skyline Education - Oylik Davomat Hisoboti") {
  const doc = new jsPDF();

  // Header banner
  doc.setFillColor(11, 25, 44); // Deep Navy
  doc.rect(0, 0, 210, 28, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 18);

  doc.setFontSize(9);
  doc.setTextColor(200, 210, 225);
  doc.text(`Yaratilgan sana: ${new Date().toLocaleDateString('uz-UZ')} ${new Date().toLocaleTimeString('uz-UZ')}`, 140, 18);

  const tableData = records.map((rec, index) => [
    index + 1,
    rec.userName,
    rec.userPosition,
    rec.date,
    rec.checkInTime || '-',
    rec.checkOutTime || '-',
    rec.status === 'ON_TIME' ? 'Vaqtida' : rec.status === 'LATE' ? `Kechikkan (${rec.minutesLate} d)` : 'Kelmagan',
    rec.workHours ? `${rec.workHours} soat` : '-'
  ]);

  autoTable(doc, {
    startY: 34,
    head: [['#', 'F.I.O', 'Lavozim', 'Sana', 'Kelgan', 'Ketgan', 'Holat', 'Ishlagan']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 62, 98],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [40, 40, 40]
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    }
  });

  doc.save(`Skyline_Davomat_Hisobot_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportToExcel(records: AttendanceRecord[]) {
  const excelData = records.map((rec, idx) => ({
    'T/r': idx + 1,
    'F.I.O': rec.userName,
    'Lavozim': rec.userPosition,
    'Sana': rec.date,
    'Kelgan vaqti': rec.checkInTime || '-',
    'Ketgan vaqti': rec.checkOutTime || '-',
    'Holat': rec.status === 'ON_TIME' ? 'Vaqtida' : rec.status === 'LATE' ? 'Kechikkan' : 'Kelmagan',
    'Kechikish (Daqiqa)': rec.minutesLate,
    'Ishlagan soati': rec.workHours || 0
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Davomat Hisoboti');

  XLSX.writeFile(workbook, `Skyline_Davomat_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportToCSV(records: AttendanceRecord[]) {
  const headers = ['T/r', 'F.I.O', 'Lavozim', 'Sana', 'Kelgan vaqti', 'Ketgan vaqti', 'Holat', 'Kechikish (Daqiqa)', 'Ishlagan soati'];
  const rows = records.map((rec, idx) => [
    idx + 1,
    `"${rec.userName}"`,
    `"${rec.userPosition}"`,
    rec.date,
    rec.checkInTime || '-',
    rec.checkOutTime || '-',
    rec.status,
    rec.minutesLate,
    rec.workHours || 0
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Skyline_Davomat_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
