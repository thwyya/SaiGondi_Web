"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/auth/authApi";
import { User } from "@/types/user";

// Helper để chuẩn hoá dữ liệu user
const normalizeUser = (userData: any): User | null => {
  const userProfile = userData?.user || userData;
  if (!userProfile) return null;

  // Ensure favorites is an array and extract _id if it's an array of objects
  const normalizedFavorites = Array.isArray(userProfile.favorites)
    ? userProfile.favorites.map((fav: any) => (typeof fav === 'object' && fav._id) ? fav._id : fav)
    : [];

  return {
    ...userProfile,
    _id: userProfile._id || userProfile.userId, // đồng bộ key _id
    favorites: normalizedFavorites,
  } as User;
};

const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user info từ token
  const fetchUser = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");

    if (token) {
      try {
        const userData = await authApi.getProfile(token);
        const normalizedUser = normalizeUser(userData);

        if (normalizedUser?._id) {
          setUser(normalizedUser);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("accessToken");
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("❌ Failed to fetch user profile:", error);
        localStorage.removeItem("accessToken");
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }

    setLoading(false);
  }, []);

  // Lần đầu mount -> fetch user
  useEffect(() => {
    fetchUser();

    // Lắng nghe thay đổi token ở các tab khác
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "accessToken") {
        fetchUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [fetchUser]);

  // Optional: tự redirect khi chưa login
  // useEffect(() => {
  //   if (!loading && !isAuthenticated) {
  //     router.push("/login");
  //   }
  // }, [loading, isAuthenticated, router]);

  const updateUser = useCallback((updater: (prevUser: User | null) => User | null) => {
    setUser(updater);
  }, []);

  return { user, isAuthenticated, loading, refetch: fetchUser, updateUser };
};

export default useUser;
