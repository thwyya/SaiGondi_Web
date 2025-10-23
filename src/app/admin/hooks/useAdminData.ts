"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { getAllDestinations } from "@/lib/place/destinationApi";
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
  const [loading, setLoading] = useState(true);

  const avatarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push("/admin/login");
      return;
    }

    Promise.all([
      api.get("/admin/stats/overview"),
      api.get("/admin/me"),
      api.get("/admin/stats/topUsers"),
    ])
      .then(([overviewRes, meRes, topUsersRes]) => {
        setStats(overviewRes.data?.data || {});

        const user = meRes.data?.data;
        if (user) {
          if (user.firstName) setFirstName(user.firstName);
          if (user.avatar) setAvatarUrl(user.avatar);
        }

        setTopUsers(topUsersRes.data?.data || []);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          router.push("/admin/login");
        } else {
          console.log("Lỗi khi lấy dữ liệu admin:", err);
        }
      })
      .finally(() => setLoading(false));

    getAllDestinations()
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
    loading,
  };
}
