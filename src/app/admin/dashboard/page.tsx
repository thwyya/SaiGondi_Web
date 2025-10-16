"use client";

import StatsGrid from "./StatsGrid";
import ChartsSection from "./ChartsSection";
import { useAdminData } from "../hooks/useAdminData";
import AdminHeader from "@/components/AdminHeader";
import TopPlaces from "./TopPlaces";
import TopUsers from "./TopUsers";

export default function AdminDashboardPage() {
  const data = useAdminData();

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <AdminHeader
        firstName={data.firstName}
        avatarUrl={data.avatarUrl}
        avatarOpen={data.avatarOpen}
        setAvatarOpen={data.setAvatarOpen}
        avatarRef={data.avatarRef}
        handleLogout={data.handleLogout}
      />
      <StatsGrid stats={data.stats} />
      <ChartsSection />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-10">
        <TopUsers topUsers={data.topUsers} />
        <TopPlaces topPlaces={data.topPlaces} />
      </div>
    </div>
  );
}


