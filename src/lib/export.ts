'use client';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';

export const exportToExcel = async (data: any[], fileName: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');

  const headers = Object.keys(data[0] ?? {});
  worksheet.addRow(headers);

  const formatValue = (val: any) => {
    if (val == null) return '';
    if (Array.isArray(val)) {
      const parts = val.map((el) => {
        if (el == null) return '';
        if (typeof el === 'object') {
          return el.name ?? el.title ?? el.label ?? el.id ?? el.coordinates ?? JSON.stringify(el);
        }
        return String(el);
      }).filter(Boolean);
      return parts.join(', ');
    }

    if (typeof val === 'object') {
      return val.name ?? val.title ?? val.label ?? val.id ?? val.coordinates ?? JSON.stringify(val);
    }

    return String(val);
  };

  data.forEach((item) => {
    const row = headers.map((header) => formatValue(item[header]));
    worksheet.addRow(row);
  });

  const buffer = await workbook.xlsx.writeBuffer();

  saveAs(new Blob([buffer]), `${fileName}.xlsx`);
};