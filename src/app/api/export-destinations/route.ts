import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import axios from 'axios';
import { BASE_URL } from '@/app/admin/utils/config';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
  // Forward Authorization header if provided by client
  const authHeader = request.headers.get('authorization') || undefined;
  const axiosConfig: any = { params: {} };
  if (authHeader) axiosConfig.headers = { Authorization: authHeader };

  // Use a server-side axios call to avoid client-only interceptors that access localStorage/window
  const res = await axios.get(`${BASE_URL}/admin/places`, axiosConfig);
    const destinations = res.data?.data?.places ?? res.data ?? [];
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Destinations');

    // Define columns
    sheet.columns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'Tên địa điểm', key: 'name', width: 30 },
      { header: 'Danh mục', key: 'categories', width: 30 },
      { header: 'Địa chỉ', key: 'address', width: 40 },
      { header: 'Trạng thái', key: 'status', width: 12 },
      { header: 'Ngày tạo', key: 'createdAt', width: 24 },
    ];

    // Add rows
    destinations.forEach((d: any) => {
      let categoriesStr = '';
      if (Array.isArray(d.categories)) {
        categoriesStr = d.categories
          .map((c: any) => {
            if (!c) return '';
            if (typeof c === 'string') return c;
            return c.name ?? c.label ?? c.value ?? '';
          })
          .filter(Boolean)
          .join(', ');
      }

      sheet.addRow({
        id: d.id ?? d._id ?? '',
        name: d.name ?? '',
        categories: categoriesStr,
        address: d.address ?? d.location ?? '',
        status: d.status === 'approved' || d.approved ? 'Đã duyệt' : 'Chờ phê duyệt',
        createdAt: d.createdAt ? new Date(d.createdAt).toLocaleString() : '',
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', 'attachment; filename="destinations.xlsx"');

    return new NextResponse(buffer, { status: 200, headers });
  } catch (err) {
    console.error('Export error', err instanceof Error ? err.stack ?? err.message : err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new NextResponse(`Export failed: ${msg}`, { status: 500, headers: { 'Content-Type': 'text/plain' } });
  }
}
