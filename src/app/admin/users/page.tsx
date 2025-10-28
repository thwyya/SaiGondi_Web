"use client";
import FilterDropdown from '@/shared/Filter';
import React, {useState, useEffect} from 'react'
import SearchBar from '../SearchBar'
import { UserTable, } from './UserTable';
import { useQuery } from "@tanstack/react-query";
import { getUsers } from '@/services/userService';
import { User } from '@/types/user';

const UsersPage = () => {

  const [filter, setFilter] = useState('')
  const [users, setUsers] = useState<User[]>([])

  const {data, isLoading, error} = useQuery({
    queryKey: ["users"],
    queryFn: getUsers, 
   })
  useEffect(() => {
      if (data) setUsers(data);
    }, [data]);
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading data</div>
  return (

      <div className="flex flex-col my-12 mx-6">
        <div id="title">
          <h1>QUẢN LÝ NGƯỜI DÙNG</h1>
          <div className="flex justify-between items-end ">
            <div id="group__1" className='flex mt-2'>
                <a href='/admin/dashboard' className='text-(--primary)'>Admin</a>
                <i className="ri-arrow-right-s-line"></i>
              <h4>QUẢN LÝ NGƯỜI DÙNG</h4>
            </div>
          </div>
        </div>

        <SearchBar 
          placeholder = 'Tìm kiếm tài khoản...'
          onSearch = {()=>{}}
          filterSlot={
            <FilterDropdown
            options={[]}
            value={filter}
            onChange={setFilter}/>
          }
          />
        <UserTable data={users || []} />
        </div>
  )
}

export default UsersPage