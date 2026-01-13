import axios from 'axios';

const API_BASE_URL = '/back/api/evaluation/criteria';

export const criteriaApi = {
  // 현재 로그인 사용자 정보 조회
  getCurrentUser: async () => {
    const response = await axios.get(`${API_BASE_URL}/current-user`, {
      withCredentials: true,
    });
    return response.data;
  },

  getAllCriteria: async () => {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  },

  getCriteriaById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  createCriteria: async (criteriaData) => {
    const response = await axios.post(API_BASE_URL, criteriaData);
    return response.data;
  },

  updateCriteria: async (id, criteriaData) => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, criteriaData);
    return response.data;
  },

  deleteCriteria: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  },
};