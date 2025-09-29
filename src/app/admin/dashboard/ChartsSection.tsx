"use client";

import CategoryChart from "./CategoryChart";
import TopPlaceChart from "./TopPlaceChart";
import MonthlyLineChart from "./MonthlyUserData";

export default function ChartsSection() {
  return (
    <>
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
    </>
  );
}
