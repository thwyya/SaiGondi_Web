"use client";

import React, { useEffect, useRef, useState } from "react";
import BackgroundBlur01 from "@/shared/BackgroundBlur01";
import { IoTrendingUp } from "react-icons/io5";
import CategoryChart from "./CategoryChart";
import TopPlaceChart from "./TopPlaceChart";
import MonthlyLineChart from "./MonthlyUserData";
import dynamic from "next/dynamic";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import AnimatedNumber from "../AnimatedNumber";
import Image from "next/image";
import { FaChevronDown } from "react-icons/fa6";
import api from "@/services/api";
import { useRouter } from "next/navigation";

const Slider = dynamic(() => import("react-slick"), { ssr: false }) as any;

interface TopUser {
  avatar: string;
  username: string;
  badges: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState({
    users: 0,
    places: 0,
    blogs: 0,
    views: 0,
  });
  const [firstName, setFirstName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/Image.svg");
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const avatarRef = useRef<HTMLDivElement | null>(null);

  const sliderRef = useRef<any>(null);
  const settings = {
    infinite: true,
    autoplay: false,
    speed: 700,
    swipeToSlide: true,
    slidesToShow: 3,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 2, dots: true } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 576, settings: { slidesToShow: 1 } },
    ],
  };

  useEffect(() => {
    api
      .get("/admin/stats/overview")
      .then((res) => {
        setStats(res.data?.data || {});
      })
      .catch((err) => console.log("Lỗi lấy thống kê:", err));

    api
      .get("/admin/me")
      .then((res) => {
        const fullName = res.data?.fullName || "";
        if (fullName) setFirstName(fullName.trim().split(" ")[0]);
        if (res.data?.avatar) setAvatarUrl(res.data.avatar);
      })
      .catch((err) => {
        console.log("Không lấy được thông tin admin:", err);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.push("/admin/login");
      });

    api
      .get("/admin/stats/popular")
      .then((res) => {
        const users = res.data?.popularUsers || [];
        setTopUsers(
          users.map((u: any) => ({
            avatar: u.avatar || "/Image.svg",
            username: u.fullName || u.firstName || "User",
            badges: u.badges?.length || 0,
          }))
        );
      })
      .catch((err) => console.log("Lỗi lấy TOP user:", err));

    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/admin/login");
  };

  return (
    <>
      <BackgroundBlur01 />

      <div className="flex flex-col xl:w-[90%] mx-auto">
        <div className="flex justify-end mt-6 px-4">
          <div
            ref={avatarRef}
            className="relative flex items-center gap-2 cursor-pointer"
            onClick={() => setAvatarOpen((v) => !v)}
          >
            <Image
              src={avatarUrl}
              alt="Avatar"
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
            <span className="font-medium text-[var(--foreground)]">
              {firstName}
            </span>
            <FaChevronDown className="text-gray-500" size={14} />

            {avatarOpen && (
              <div className="absolute right-0 top-[110%] w-44 bg-white rounded-xl shadow-lg py-1 border border-gray-100 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-xl"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 justify-between m-4 lg:m-8 gap-4 lg:gap-8">
          <div className="flex flex-col rounded-2xl py-6 px-2 lg:p-6 gap-2 bg-[#EDEEFC]">
            <h4 className="text-sm lg:text-base font-bold text-center">Số địa điểm</h4>
            <div className="flex flex-col lg:flex-row gap-2 items-center justify-center">
              <AnimatedNumber value={stats.places || 0} />
              <span className="text-xs flex">+11.01% <IoTrendingUp /></span>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl py-6 px-2 lg:p-6 gap-2 bg-[#E6F1FD]">
            <h4 className="text-sm lg:text-base font-bold text-center">Lượt truy cập</h4>
            <div className="flex flex-col lg:flex-row gap-2 items-center justify-center">
              <AnimatedNumber value={stats.views || 0} />
              <span className="text-xs flex">+11.01% <IoTrendingUp /></span>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl py-6 px-2 lg:p-6 gap-2 bg-[#EDEEFC]">
            <h4 className="text-sm lg:text-base font-bold text-center">Số người dùng</h4>
            <div className="flex flex-col lg:flex-row gap-2 items-center justify-center">
              <AnimatedNumber value={stats.users || 0} />
              <span className="text-xs flex">+11.01% <IoTrendingUp /></span>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl py-6 px-2 lg:p-6 gap-2 bg-[#E6F1FD]">
            <h4 className="text-sm lg:text-base font-bold text-center">Số bài viết</h4>
            <div className="flex flex-col lg:flex-row gap-2 items-center justify-center">
              <AnimatedNumber value={stats.blogs || 0} />
              <span className="text-xs flex">+11.01% <IoTrendingUp /></span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 md:px-6">
          <div className="bg-[#F9F9FA] rounded-xl px-4">
            <TopPlaceChart />
          </div>
          <div className="bg-[#F9F9FA] rounded-xl">
            <CategoryChart />
          </div>
        </div>

        <div className="w-[96%] mx-auto bg-[#F9F9FA] mt-8 px-4 max-h-[400px]">
          <MonthlyLineChart />
        </div>

        <div className="flex flex-col w-full mt-10 px-6">
          <h2 className="text-[#343C6A] text-lg font-bold mb-3">
            TOP 5 NGƯỜI DÙNG NỔI BẬT
          </h2>
          <div className="flex w-full justify-center items-center bg-white rounded-2xl">
            <div className="flex w-[80%]">
              <Slider
                ref={sliderRef}
                {...settings}
                className="w-full flex justify-center p-6 items-center"
              >
                {topUsers.map((user, index) => (
                  <div
                    className="flex flex-col justify-center items-center"
                    key={index}
                  >
                    <img
                      src={user.avatar}
                      alt=""
                      className="h-14 w-14 rounded-full object-cover"
                    />
                    <h6 className="font-semibold mt-1">{user.username}</h6>
                    <h6 className="text-sm text-gray-500">
                      {user.badges} badges
                    </h6>
                  </div>
                ))}
              </Slider>
            </div>
            <button
              onClick={() => sliderRef.current?.slickNext()}
              className="shadow-[4.33px_4.33px_19.48px_-2.16px_#E7E4E8CC] rounded-full h-10 w-10 flex justify-center items-center"
            >
              <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
