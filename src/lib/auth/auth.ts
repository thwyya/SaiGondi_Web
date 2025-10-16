import { jwtDecode } from "jwt-decode";

type TokenPayload = {
  id?: string;
};

export const getCurrentUserId = () => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.id || null;
  } catch (err) {
    console.error("Lỗi giải mã token:", err);
    return null;
  }
};
