'use client';

import { authApi } from "@/lib/auth/authApi";
import { wardApi } from "@/lib/ward/wardApi";
import { checkinApi } from "@/lib/checkin/checkinApi";
import React, { useEffect, useState } from "react";

export default function MapBanner() {
  const [firstName, setFirstName] = useState("Bạn");
  const [totalWards, setTotalWards] = useState<number>(0);
  const [visitedCount, setVisitedCount] = useState<number>(0);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      authApi.getProfile(token)
        .then((res) => {
          if (res.user?.fullName) {
            const nameParts = res.user.fullName.trim().split(" ");
            setFirstName(nameParts[0] || "Bạn");
          }
        })
        .catch((err) => console.error("Profile API error:", err));
    }
    wardApi.getAll()
      .then((res: any) => {
        if (Array.isArray(res)) {
          setTotalWards(res.length);
        }
        else if (res?.wards) {
          setTotalWards(res.wards.length);
        }
      })
      .catch((err: any) => console.error("Ward API error:", err));


    checkinApi.getUserCheckins()
      .then((res: any) => {
        if (res?.length >= 0) {
          setVisitedCount(res.length);
        }
      })
      .catch((err: any) => console.error("Checkin API error:", err));
  }, []);

  return (
    <section className="relative w-full py-10">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center px-4">
        <p className="text-xs sm:text-sm tracking-widest mb-2">
          HÀNH TRÌNH CỦA BẠN
        </p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-snug">
          KHÁM PHÁ HÀNH TRÌNH CỦA BẠN <br className="hidden sm:block" /> TẠI
          SÀI GÒN
        </h1>
        <button className="btn-primary px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
          Bắt đầu khám phá
        </button>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-12 sm:mt-16">
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 sm:gap-0 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Sơ Đồ Hành Trình Của {firstName}
          </h2>
          <button className="btn-outline-primary px-4 py-2 rounded-full text-xs sm:text-sm">
            {visitedCount}/{totalWards} xã, phường
          </button>
        </div>
      </div>
    </section>
  );
}
