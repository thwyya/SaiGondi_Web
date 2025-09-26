"use client";
import FilterDropdown from '@/shared/Filter';
import React, {useState} from 'react'
import SearchBar from '../SearchBar'
import { ReviewTable } from './ReviewTable';
import { useQuery } from "@tanstack/react-query";       
import { getReviews } from '@/services/reviewService';   
// import { Review } from '@/types/review'; // Corrected import - commented out

// Explicitly define Review interface here for testing
interface Review {
  _id: string;
  userId: {
    name: string;
    avatar: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  destinationId?: string;
  status?: string;
}

const Page = () => {

  const [filter, setFilter] = useState('')
  const {data, isLoading, error} = useQuery({
    queryKey: ["reviews"],
    queryFn: () => getReviews(),
  })
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;
  return (

      <div className="flex flex-col my-12 mx-6">
        <div id="title">
          <h1>QUẢN LÝ ĐÁNH GIÁ, BÌNH LUẬN</h1>
          <div className="flex justify-between items-end ">
            <div id="group__1" className='flex'>
              <h4>Admin</h4>
              <i className="ri-arrow-right-s-line"></i>
              <h4>QUẢN LÝ ĐÁNH GIÁ, BÌNH LUẬN</h4>
            </div>

          </div>
        </div>

        <SearchBar 
          placeholder = 'Tìm kiếm reviews....'
          onSearch = {()=>{}}
          filterSlot={
            <FilterDropdown
            options={['Trạng thái đã duyệt','Trạng thái chưa duyệt', 'Mới nhất', 'Cũ nhất' ]}
            value={filter}
            onChange={setFilter}/>
          }
          />

        <ReviewTable data={data?? []}/>
        </div>
  )
}

export default Page