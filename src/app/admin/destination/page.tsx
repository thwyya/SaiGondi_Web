"use client";
import { useState, useEffect } from 'react'
import React from 'react'
import SearchBar from '../SearchBar'
import { DestinationTable } from './DestinationTable';
import DestinationPopup from './AddDestinationPopup'
import FilterDropdown from '@/shared/Filter';
import { useQuery } from "@tanstack/react-query";
import { getDestinations } from '@/services/destinationService';
import api from '@/services/api';
import { Destination } from '@/types/destination';

export default function Page() {

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('')
  const [destinations, setDestinations] = useState<Destination[]>([])


  const mapFiterToParams = (filter: string) => {
    switch (filter) {
      case "Đã phê duyệt":
        return "approved";
      case "Chưa phê duyệt":
        return "pending";
      default:
        return {};
    }
  };
  const { data, isLoading } = useQuery({
    queryKey: ['destinations', { filter: mapFiterToParams(filter) }],
    queryFn: getDestinations
  });


  useEffect(() => {
    if (data) setDestinations(data);
  }, [data]);

  const handleSearch = async (value: string) => {
    try {
      const res = await api.get(`/places/search?name=${encodeURIComponent(value)}`);
      setDestinations(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }

  const handleClosePopup = () => {
    setIsOpen(false);
  }

  if (isLoading) return <div>Loading...</div>
  console.log("Destinations data:", destinations);
  return (
    <>
      {isOpen && <DestinationPopup onClose={handleClosePopup} />}
      <div className="flex flex-col my-12 mx-6">
        <div id="title">
          <h1>QUẢN LÝ ĐỊA ĐIỂM</h1>
          <div className="flex justify-between items-end ">
            <div id="group__1" className='flex'>
              <h4>Admin</h4>
              <i className="ri-arrow-right-s-line"></i>
              <h4>QUẢN LÝ ĐỊA ĐIỂM</h4>
            </div>
            <div id="group__btn" className='gap-2 flex'>
              <button className=' flex bg-[#DEDEFA] text-(--primary) gap-2 p-2 rounded-md'>
                <i className="ri-upload-cloud-line"></i>
                <h4>Xuất file</h4>
              </button>
              <button onClick={() => setIsOpen(true)} className="flex btn-primary text-white gap-2 p-2 rounded-md">
                <i className="ri-add-line"></i>
                <h4>Thêm địa điểm</h4>
              </button>
            </div>
          </div>
        </div>

        <SearchBar
          placeholder='Tìm kiếm địa điểm....'
          onSearch={handleSearch}
          filterSlot={
            <FilterDropdown
              options={[
                "Đã phê duyệt",
                "Chưa phê duyệt"
              ]}
              value={filter}
              onChange={setFilter}
            />
          }
        />
        <DestinationTable data={destinations ?? []} />
      </div>
    </>
  )
}

