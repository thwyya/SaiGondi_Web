"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/services/api";
import { placeApi } from "@/lib/place/placeApi";
import { useRouter } from "next/navigation";
import { TopPlace, TopUser } from "@/app/assets/data/topPlace";

export function useAdminData() {
  const router = useRouter();
  const [stats, setStats] = useState({
    users: 0,
    places: 0,
    blogs: 0,
    views: 0,
    growth: { users: 0, places: 0, blogs: 0, views: 0 },
  });

  const [firstName, setFirstName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/Image.svg");
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [topPlaces, setTopPlaces] = useState<TopPlace[]>([]);

  const avatarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedName = localStorage.getItem("firstName");
    const savedAvatar = localStorage.getItem("avatar");
    if (savedName) setFirstName(savedName);
    if (savedAvatar) setAvatarUrl(savedAvatar);

    api.get("/admin/stats/overview")
      .then((res) => setStats(res.data?.data || {}))
      .catch(() => console.log("Lỗi lấy thống kê"));

    api.get("/admin/me")
      .then((res) => {
        const fullName = res.data?.fullName || "";
        if (fullName) {
          const first = fullName.trim().split(" ")[0];
          setFirstName(first);
          localStorage.setItem("firstName", first);
        }
        if (res.data?.avatar) {
          setAvatarUrl(res.data.avatar);
          localStorage.setItem("avatar", res.data.avatar);
        }
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.push("/admin/login");
      });

    api.get("/admin/stats/topUsers")
      .then((res) => setTopUsers(res.data?.data || []))
      .catch(() => console.log("Lỗi lấy TOP users"));

    placeApi.getAll()
      .then((places) => {
        if (Array.isArray(places)) {
          const sorted = [...places]
            .sort((a, b) => {
              const ratingDiff = (b.avgRating || 0) - (a.avgRating || 0);
              if (ratingDiff !== 0) return ratingDiff;
              return (b.totalCheckins || 0) - (a.totalCheckins || 0);
            })
            .slice(0, 5);
          setTopPlaces(sorted);
        }
      })
      .catch(() => console.log("Lỗi lấy TOP places"));
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
    localStorage.removeItem("firstName");
    localStorage.removeItem("avatar");
    router.push("/admin/login");
  };

  return {
    stats,
    firstName,
    avatarUrl,
    avatarOpen,
    setAvatarOpen,
    avatarRef,
    topUsers,
    topPlaces,
    handleLogout,
  };
}
