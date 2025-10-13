import axiosInstance from "@/lib/axiosInstance";

export const getTopSearches = async () => {
  try {
    const response = await axiosInstance.get("/hot/top-searches");
    return response.data?.data ?? [];
  } catch (error) {
    console.error("Error fetching top searches:", error);
    return [];
  }
};
