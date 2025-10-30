"use client";
import FilterDropdown from '@/shared/Filter';
import React, { useState, useEffect } from 'react'
import SearchBar from '../SearchBar'
import { UserTable, } from './UserTable';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUsers } from '@/services/userService';
import { User } from '@/types/user';
import { exportToExcel } from '@/lib/export';
const UsersPage = () => {

  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  
  const mapFiterToParams = (filter: string): string | undefined => {
    switch (filter) {
      case "Hoạt động":
        return "false";
      case "Bị khoá":
        return "true";
      case "Tất cả":
        return undefined;
      default:
        return undefined;
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", { filter: mapFiterToParams(filter) }],
    queryFn: getUsers,
  })
  useEffect(() => {
    if (data) setUsers(data);
  }, [data]);


  const handleSearch = async (value: string) => {
    const q = value?.trim();
    if (!q) {
      try {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        const all = await queryClient.fetchQuery({
          queryKey: ['users', { filter: mapFiterToParams(filter) }],
          queryFn: getUsers,
        });
        setUsers(Array.isArray(all) ? all : []);
      } catch (err) {
        console.error('Refetch all users failed', err);
      }
      return;
    }

    try {
      const params: Record<string, any> = { name: q };
      const f = mapFiterToParams(filter);
      if (f) params.filter = f;
      const result = await queryClient.fetchQuery({
        queryKey: ['users', params],
        queryFn: getUsers,
      });
      setUsers(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error('Search (via getUsers) failed', err);
    }
  }
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === users?.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(users?.map(u => u._id || u.id) ?? []))
    }
  }
  const onClickExport = async () => {
      setIsExporting(true)
      setExportStatus(null)
      try {
        const dataToExport = selectedIds.size > 0
          ? users.filter(d => selectedIds.has(d._id || d.id))
          : users
  
        if (!dataToExport || dataToExport.length === 0) {
          setExportStatus('Không có dữ liệu để xuất')
          setTimeout(() => setExportStatus(null), 2500)
          return
        }
  
        await exportToExcel(dataToExport, 'users')
        setExportStatus('Đã tải xong')
        setTimeout(() => setExportStatus(null), 2500)
      } catch (err) {
        console.error('Export failed', err)
        setExportStatus('Xuất file thất bại')
      } finally {
        setIsExporting(false)
      }
    }
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading data</div>
  return (
    <div className="flex flex-col my-12 mx-6">
      <div id="title" className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">QUẢN LÝ NGƯỜI DÙNG</h1>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href='/admin/dashboard' className='hover:text-blue-600 transition-colors'>Admin</a>
            <i className="ri-arrow-right-s-line"></i>
            <span className="font-medium text-gray-800">Quản lý người dùng</span>
          </div>
          <button 
            onClick={onClickExport} 
            disabled={isExporting} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all font-medium ${isExporting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <i className="ri-upload-cloud-line text-lg"></i>
            <span className='whitespace-nowrap'>{isExporting ? 'Đang xuất...' : 'Xuất file'}</span>
          </button>
        </div>
      </div>

      <SearchBar
        placeholder='Tìm kiếm tài khoản...'
        onSearch={handleSearch}
        filterSlot={
          <FilterDropdown
            options={[
              "Tất cả",
              "Hoạt động",
              "Bị khoá",
            ]}
            value={filter}
            onChange={setFilter} />
        }
      />
      
      <div className="mt-4">
        <UserTable 
          data={users || []} 
          onSelect={toggleSelect}
          onSelectAll={toggleSelectAll}
          selectedIds={selectedIds}
        />
      </div>
      
      {exportStatus && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 font-medium">
          {exportStatus}
        </div>
      )}
    </div>
  )
}

export default UsersPage