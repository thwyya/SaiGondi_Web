import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const placeApi = {
  getAll: async () => {
    const res = await axios.get(`${API_URL}/places`);
    return res.data.data;
  },

  getNearbyPlaces: async (latitude: number, longitude: number, radius = 5000) => {
    const token = localStorage.getItem("accessToken");
    const res = await axios.get(`${API_URL}/places/nearby`, {
      params: { latitude, longitude, radius },
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return res.data.data;
  },

  likePlace: async (id: string) => {
    const token = localStorage.getItem("accessToken");
    const res = await axios.patch(`${API_URL}/places/${id}`, {}, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return res.data;
  },

  addToFavorites: async (id: string) => {
    const token = localStorage.getItem("accessToken");
    const res = await axios.post(`${API_URL}/places/${id}/favorite`, {}, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return res.data;
  },

  removeFromFavorites: async (id: string) => {
    const token = localStorage.getItem("accessToken");
    const res = await axios.delete(`${API_URL}/places/${id}/favorite`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return res.data;
  },
};
