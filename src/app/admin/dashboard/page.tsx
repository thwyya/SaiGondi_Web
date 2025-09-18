"use client";
import React, {useRef } from "react";
import BackgroundBlur01 from '@/shared/BackgroundBlur01'
import {IoTrendingUp } from "react-icons/io5";
import CategoryChart from './CategoryChart';
import TopPlaceChart from './TopPlaceChart';
import MonthlyLineChart from './MonthlyUserData';
import {users } from '@/app/assets/data/user';
import dynamic from "next/dynamic";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import AnimatedNumber from '../AnimatedNumber'

const Slider = dynamic(() => import("react-slick"), { ssr: false }) as any;

const Page = () => {

  const sliderRef1 = useRef<any>(null);
  const sliderRef2 = useRef<any>(null);

  const settings_1 = {
  
      infinite: true,
      autoplay: false,
      speed: 700,
      swipeToSlide: true,
      slidesToShow: 3,  
      vertical: false, 
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
            infinite: true,
            dots: true,        
           
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2,
          },
        },
        {
          breakpoint: 576, 
          settings: {
            slidesToShow: 1,
          },
        },
      ]
      
    };

  return <>
  <BackgroundBlur01/>

    <div className="flex flex-col xl:w-[90%] mx-auto ">
      <div className="flex gap-2 justify-end mt-6">
        <h4>hhh</h4>
        <img src="https://i.pinimg.com/736x/88/fb/12/88fb12fe971a35a0ad5ed2ea1dafcad0.jpg" alt="" 
        className='rounded-lg h-5 w-5'/>
        <i className="ri-arrow-down-s-fill"></i>

      </div>
      <div id="card__groud" className='grid grid-cols-4 justify-between m-8 gap-2 lg:gap-8'>
        <div className="flex flex-col rounded-2xl py-6 px-2 lg:p-6  gap-2 bg-[#EDEEFC] ">
          <h4 className="text-sm lg:text-base font-bold text-center">Số địa điểm</h4>
          <div className="flex flex-col lg:flex-row gap-2 items-center ">
            <AnimatedNumber value={7265} />
            <span className="text-xs flex">+11.01%  <IoTrendingUp /></span>

          </div>
        </div>

        <div className="flex flex-col rounded-2xl py-6 px-2 lg:p-6 gap-2 bg-[#E6F1FD]">
          <h4 className="text-sm lg:text-base font-bold text-center">Lượt truy cập</h4>
          <div className="flex flex-col lg:flex-row gap-2 items-center ">
             <AnimatedNumber value={7128} />
             <span className="text-xs flex">+11.01%  <IoTrendingUp /></span>

          </div>
        </div>

        <div className="flex flex-col rounded-2xl py-6 px-1 lg:p-6  gap-2 bg-[#EDEEFC]">
          <h4 className="text-sm lg:text-base font-bold text-center">Số người dùng</h4>
          <div className="flex flex-col lg:flex-row gap-2 items-center ">
            <AnimatedNumber value={7265} />
            <span className="text-xs flex">+11.01%  <IoTrendingUp /></span>
    
          </div>
        </div>

        <div className="flex flex-col rounded-2xl py-6 px-2 lg:p-6 gap-2 bg-[#E6F1FD]">
          <h4 className="text-sm lg:text-base font-bold text-center">Số bài viết</h4>
          <div className="flex flex-col lg:flex-row gap-2 items-center ">
            <AnimatedNumber value={7265} />
            <span className="text-xs flex">+11.01%  <IoTrendingUp /></span>
           
          </div>
        </div>
      </div>

      <div id="chart__group" className='grid grid-cols-1 md:grid-cols-2 gap-4 px-6'>
        <div id="chart__1" className="bg-[#F9F9FA] rounded-xl px-4">
          <TopPlaceChart/>
        </div>
        <div id="chart__2" className='bg-[#F9F9FA] rounded-xl'>
          <CategoryChart/>
        </div>
      </div>
      <div className="w-[96%] mx-auto bg-[#F9F9FA] mt-8 px-4 max-h-[400px]">
        <div className="w-full h-full">
          <MonthlyLineChart/>
        </div>
      </div>

      <div className="grid grid-cols-2 flex gap-8  mt-8 mx-6 ">
        <div className="flex flex-col w-full justify-center">
          <h2 className="text-[#343C6A]">TOP 5 NGƯỜI DÙNG NỔI BẬT</h2>
          <div className="flex w-full justify-center items-center bg-white rounded-2xl">
            <div className="flex  w-[80%] ">    
              <Slider ref={sliderRef1} {...settings_1} className="w-full flex justify-center p-6 items-center ">        
                {users.map((user,index)=> (
                  <div className='flex flex-col justify-center' key={index}>
                    <img src={user.avatar} alt="" className='h-10 w-10 rounded-full' />
                      <h6>{user.username}</h6>
                      <h6>{user.badges}</h6>
                  </div>
                )) }                    
              </Slider>                      
             </div>
              <button onClick={() => sliderRef1.current.slickNext()} className="shadow-[4.33px_4.33px_19.48px_-2.16px_#E7E4E8CC] rounded-full h-10 w-10 overflow-hidden flex justify-center items-center ">
                <i className="ri-arrow-right-s-line text-xl lg:text-3xl xl:text-5xl text-gray-400"></i>
              </button>  
          </div>
        </div>

        <div className="flex flex-col w-full justify-center">
          <h2 className="text-[#343C6A]">TOP 5 NGƯỜI DÙNG NỔI BẬT</h2>
          <div className="flex w-full justify-center items-center bg-white rounded-2xl">
            <div className="flex  w-[80%] ">    
              <Slider ref={sliderRef2} {...settings_1} className="w-full flex justify-center p-6 items-center ">        
                {users.map((user,index)=> (
                  <div className='flex flex-col justify-center' key={index}>
                    <img src={user.avatar} alt="" className='h-10 w-10 rounded-full' />
                      <h6>{user.username}</h6>
                      <h6>{user.badges}</h6>
                  </div>
                )) }                    
              </Slider>                      
             </div>
              <button onClick={() => sliderRef2.current.slickNext()} className="shadow-[4.33px_4.33px_19.48px_-2.16px_#E7E4E8CC] rounded-full h-10 w-10 overflow-hidden flex justify-center items-center ">
                <i className="ri-arrow-right-s-line text-xl lg:text-3xl xl:text-5xl text-gray-400"></i>
              </button>  
            </div>
          </div>
      </div>
    </div>
  </>
}

export default Page;