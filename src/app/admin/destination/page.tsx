"use client";
import { useState, useEffect } from 'react'
import React from 'react'
import SearchBar from '../SearchBar'
import { DestinationTable } from './DestinationTable';
import DestinationPopup from './AddDestinationPopup'
import FilterDropdown from '@/shared/Filter';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AddPlace } from '@/app/user/destination/addPlaceForm';
import { getDestinations } from '@/services/destinationService';
import api from '@/services/api';
import { Destination } from '@/types/destination';


export default function Page() {

  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('')
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);


  const mapFiterToParams = (filter: string): string | undefined => {
    switch (filter) {
      case "Đã phê duyệt":
        return "approved";
      case "Chưa phê duyệt":
        return "pending";
      case "Tất cả":
        return undefined;
      default:
        return undefined;
    }
  };
  const { data, isLoading } = useQuery({
    queryKey: ['destinations', { filter: mapFiterToParams(filter) }],
    queryFn: getDestinations
  });

  // Fetch initial data
  useEffect(() => {
    if (data) setDestinations(data);
  }, [data]);

  const handleSearch = async (value: string) => {
    const q = value?.trim();
    if (!q) {
      try {
        queryClient.invalidateQueries({ queryKey: ['destinations'] });
        const all = await queryClient.fetchQuery({
          queryKey: ['destinations', { filter: mapFiterToParams(filter) }],
          queryFn: getDestinations,
        });
        setDestinations(Array.isArray(all) ? all : []);
      } catch (err) {
        console.error('Refetch all destinations failed', err);
      }
      return;
    }

    try {
      const params: Record<string, any> = { name: q };
      const f = mapFiterToParams(filter);
      if (f) params.filter = f;
      const result = await queryClient.fetchQuery({
        queryKey: ['destinations', params],
        queryFn: getDestinations,
      });
      setDestinations(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error('Search (via getDestinations) failed', err);
    }
  }
  const onClickExport = async () => {
    setIsExporting(true);
    setExportStatus(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      setExportStatus('Đang tải file từ server...');
      const res = await fetch('/api/export-destinations', { headers });
      if (!res.ok) {
        const text = await res.text().catch(() => 'Lỗi server');
        throw new Error(text);
      }
      const blob = await res.blob();
      try {
        setExportStatus('Đang chuẩn bị tải...');
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = `destinations.xlsx`;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setExportStatus('Đã tải xong');
        setTimeout(() => setExportStatus(null), 2500);
      } catch (err) {
        console.error('Download failed', err);
        setExportStatus('Tải xuống thất bại');
      }
    } catch (err: any) {
      console.error(err);
      setExportStatus(err?.message ?? 'Có lỗi xảy ra');
    } finally {
      setIsExporting(false);
    }
  }

  const handleClosePopup = () => {
    setIsOpen(false);
  }

  const handleDeleteSuccess = (deletedId: string) => {
    setDestinations(prev => prev.filter(d => d.id !== deletedId));
    queryClient.invalidateQueries({ queryKey: ['destinations'] });
  }

  const handleUpdateSuccess = (updated: Destination) => {
    setDestinations(prev => prev.map(d => d.id === updated.id ? { ...d, ...updated } : d));
    queryClient.invalidateQueries({ queryKey: ['destinations'] });
  }

  if (isLoading) return <div>Loading...</div>
  return (
    <>
      {/* {isOpen && <DestinationPopup onClose={handleClosePopup} />} */}
      <div className="flex flex-col my-6 mx-4 md:mx-6">
        <div id="title">
          <h1 className='text-3xl font-semibold'>QUẢN LÝ ĐỊA ĐIỂM</h1>
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4">
            <div id="group__1" className='flex'>
              <h4><a href="/admin/dashboard">Admin</a></h4>
              <i className="ri-arrow-right-s-line"></i>
              <h4>QUẢN LÝ ĐỊA ĐIỂM</h4>
            </div>
            <div id="group__btn" className='gap-2 flex flex-wrap items-center'>
              <button onClick={onClickExport} disabled={isExporting} className={`flex bg-[#DEDEFA] gap-2 px-3 py-2 rounded-md hover:bg-blue-200 hover:text-blue-700 cursor-pointer text-sm ${isExporting ? 'opacity-60 pointer-events-none' : ''}`}>
                <i className="ri-upload-cloud-line"></i>
                <span className='whitespace-nowrap'>{isExporting ? 'Đang xuất...' : 'Xuất file'}</span>
              </button>
              <button onClick={() => setIsOpen(true)} className="flex btn-primary text-white gap-2 px-3 py-2 rounded-md text-sm">
                <i className="ri-add-line"></i>
                <span className='whitespace-nowrap'>Thêm địa điểm</span>
              </button>
              <AddPlace open={isOpen} setOpen={setIsOpen} />
            </div>
          </div>
        </div>

        <SearchBar
          placeholder='Tìm kiếm địa điểm....'
          onSearch={handleSearch}
          filterSlot={
            <FilterDropdown
              options={[
                "Tất cả",
                "Đã phê duyệt",
                "Chưa phê duyệt",
              ]}
              value={filter}
              onChange={setFilter}
            />
          }
        />

        <DestinationTable
          data={destinations ?? []}
          onDeleteSuccess={handleDeleteSuccess}
          onUpdateSuccess={handleUpdateSuccess}
        />
        {exportStatus && (
          <div className="mt-3 text-sm text-gray-600">{exportStatus}</div>
        )}
      </div>
    </>
  )
}

