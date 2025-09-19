import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const questionApi = {
  getQuestions: async (page = 1, limit = 10) => {
    const res = await axios.get(`${API_URL}/questions`, {
      params: { page, limit },
      headers: { ...getAuthHeader() },
    });
    return res.data.data;
  },
  getQuestionById: async (id: string) => {
    const res = await axios.get(`${API_URL}/questions/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return res.data.data;
  },
  createQuestion: async (payload: { title: string }) => {
    const res = await axios.post(`${API_URL}/questions`, payload, {
      headers: { ...getAuthHeader() },
    });
    return res.data.data;
  },
  likeQuestion: async (id: string) => {
    const res = await axios.patch(`${API_URL}/questions/${id}/like`, {}, {
      headers: { ...getAuthHeader() },
    });
    return res.data;
  },

  addAnswer: async (qid: string, payload: { content: string }) => {
    const res = await axios.post(`${API_URL}/questions/${qid}/answers`, payload, {
      headers: { ...getAuthHeader() },
    });
    return res.data.data;
  },
  likeAnswer: async (answerId: string) => {
    const res = await axios.patch(`${API_URL}/questions/answers/${answerId}/like`, {}, {
      headers: { ...getAuthHeader() },
    });
    return res.data;
  },
  updateAnswer: async (answerId: string, payload: { content: string }) => {
    const res = await axios.put(`${API_URL}/questions/answers/${answerId}`, payload, {
      headers: { ...getAuthHeader() },
    });
    return res.data.data;
  },
  deleteAnswer: async (answerId: string) => {
    const res = await axios.delete(`${API_URL}/questions/answers/${answerId}`, {
      headers: { ...getAuthHeader() },
    });
    return res.data;
  },
  updateQuestion: async (id: string, payload: { title: string }) => {
    const res = await axios.put(`${API_URL}/questions/${id}`, payload, {
        headers: { ...getAuthHeader() },
    });
    return res.data.data;
    },
  deleteQuestion: async (id: string) => {
    const res = await axios.delete(`${API_URL}/questions/${id}`, {
        headers: { ...getAuthHeader() },
    });
    return res.data;
   },

};
