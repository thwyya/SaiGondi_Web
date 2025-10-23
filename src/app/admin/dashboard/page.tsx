"use client";

import StatsGrid from "./StatsGrid";
import ChartsSection from "./ChartsSection";
import { useAdminData } from "../hooks/useAdminData";
import TopPlaces from "./TopPlaces";
import TopUsers from "./TopUsers";

export default function AdminDashboardPage() {
  const data = useAdminData();

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8"> 
      <StatsGrid stats={data.stats} />
      <div className="mt-6">
        <ChartsSection />
      </div>      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-2">
        <TopUsers topUsers={data.topUsers} />
        <TopPlaces topPlaces={data.topPlaces} />
      </div>
    </div>
  );
}


