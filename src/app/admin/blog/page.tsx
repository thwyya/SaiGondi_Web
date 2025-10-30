"use client";

import React, {useState, useEffect} from 'react';
import SearchBar from '../SearchBar';
import { BlogTable } from './BlogTable';
import { useQuery } from "@tanstack/react-query";
import { blogApi } from '@/lib/blog/blogApi';
import { Blog } from '@/types/blog';
import { exportToExcel } from '@/lib/export';


const Page = () => {

  const [filter, setFilter] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<Blog[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());


  const {data: blogResponse, isLoading, error} = useQuery({
    queryKey: ["posts"],
    queryFn: () => blogApi.getBlogByAdmin({ limit: 1000 }),
  })

  useEffect(() => {
    if (blogResponse?.data) {
      let dataToFilter = blogResponse.data.filter((blog: Blog) => !blog.originalPostId);
      
      let statusFilter = '';
      if (filter === 'Đã duyệt') {
        statusFilter = 'approved';
      } else if (filter === 'Chưa duyệt') {
        statusFilter = 'pending';
      } else if (filter === 'Từ chối') {
        statusFilter = 'rejected';
      } else if (filter === 'Đã xóa') {
        statusFilter = 'deleted';
      }


      if (filter !== 'Tất cả') {
        dataToFilter = dataToFilter.filter((blog: Blog) => blog.status === statusFilter);
      }

      if (searchQuery) {
        dataToFilter = dataToFilter.filter((blog: Blog) =>
          (blog.title && blog.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (blog.authorId && blog.authorId.fullName && blog.authorId.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      setFilteredData(dataToFilter);
    }
  }, [blogResponse?.data, filter, searchQuery]);

  const handleExport = () => {
    const dataToExport = selectedIds.size > 0
      ? filteredData.filter(blog => selectedIds.has(blog._id))
      : filteredData;

    if (dataToExport.length > 0) {
      exportToExcel(dataToExport, 'blogs');
    } else {
      alert("Không có dữ liệu để xuất.");
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>
  if (error) return <div className="flex justify-center items-center h-screen">Error loading data: {error.message}</div>

  return (
      <div className="flex flex-col my-12 mx-6 bg-white rounded-lg shadow-sm p-6">
        <div id="title" className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">QUẢN LÝ BÀI VIẾT BLOG</h1>
          <div className="flex justify-between items-end mt-2">
            <div id="group__1" className='flex items-center text-sm text-gray-600'>
              <h4>Admin</h4>
              <i className="ri-arrow-right-s-line mx-1"></i>
              <h4 className="text-gray-900 font-medium">QUẢN LÝ BÀI VIẾT BLOG</h4>
            </div>
          </div>
        </div>

        <SearchBar 
          placeholder = 'Tìm kiếm theo tiêu đề hoặc tên tác giả....'
          onSearch = {setSearchQuery}
          filterSlot = {
            <div className="flex items-center gap-2">
              <button 
                onClick={handleExport}
                className="flex bg-[#DEDEFA] text-(--primary) gap-2 p-2 rounded-md"
              >
                <i className="ri-upload-cloud-line"></i>
                <h4>Xuất file</h4>
              </button>
            </div>
          }
        />
        <BlogTable 
          data={filteredData}

        />
      </div>
  )
}

export default Page
