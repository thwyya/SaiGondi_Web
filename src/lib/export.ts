'use client';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';

export const exportToExcel = async (data: any[], fileName: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');

  const headers = Object.keys(data[0]);
  worksheet.addRow(headers);

 
  data.forEach((item) => {
    const row = headers.map((header) => item[header]);
    worksheet.addRow(row);
  });

  const buffer = await workbook.xlsx.writeBuffer();

  saveAs(new Blob([buffer]), `${fileName}.xlsx`);
};