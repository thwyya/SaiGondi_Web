"use client";

import { IoTrendingUp } from "react-icons/io5";
import AnimatedNumber from "../AnimatedNumber";

export default function StatsGrid({ stats }: any) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 m-6 gap-4">
      <div className="flex flex-col rounded-2xl py-6 px-2 lg:p-6 gap-2 bg-[#EDEEFC]">
        <h4 className="text-sm lg:text-base font-bold text-center">Số địa điểm</h4>
        <div className="flex flex-col lg:flex-row gap-2 items-center justify-center">
          <AnimatedNumber value={stats?.places ?? 0} />
          <span className="text-xs flex items-center gap-1">
            {(stats?.growth?.places ?? 0).toFixed(2)}% <IoTrendingUp />
          </span>
        </div>
      </div>

      <div className="flex flex-col rounded-2xl py-6 px-2 lg:p-6 gap-2 bg-[#FDEFE6]">
        <h4 className="text-sm lg:text-base font-bold text-center">Lượt truy cập</h4>
        <div className="flex flex-col lg:flex-row gap-2 items-center justify-center">
          <AnimatedNumber value={stats?.views ?? 0} />
          <span className="text-xs flex items-center gap-1">
            {(stats?.growth?.views ?? 0).toFixed(2)}% <IoTrendingUp />
          </span>
        </div>
      </div>

      <div className="flex flex-col rounded-2xl py-6 px-2 lg:p-6 gap-2 bg-[#EDEEFC]">
        <h4 className="text-sm lg:text-base font-bold text-center">Số người dùng</h4>
        <div className="flex flex-col lg:flex-row gap-2 items-center justify-center">
          <AnimatedNumber value={stats?.users ?? 0} />
          <span className="text-xs flex items-center gap-1">
            {(stats?.growth?.users ?? 0).toFixed(2)}% <IoTrendingUp />
          </span>
        </div>
      </div>

      <div className="flex flex-col rounded-2xl py-6 px-2 lg:p-6 gap-2 bg-[#E6F1FD]">
        <h4 className="text-sm lg:text-base font-bold text-center">Số bài viết</h4>
        <div className="flex flex-col lg:flex-row gap-2 items-center justify-center">
          <AnimatedNumber value={stats?.blogs ?? 0} />
          <span className="text-xs flex items-center gap-1">
            {(stats?.growth?.blogs ?? 0).toFixed(2)}% <IoTrendingUp />
          </span>
        </div>
      </div>
    </div>
  );
}
