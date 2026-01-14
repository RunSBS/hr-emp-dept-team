import axios from 'axios';

const API_BASE_URL = '/back/api/reward/policy';

export const policyApi = {
  // 현재 로그인 사용자 정보 조회
  getCurrentUser: async () => {
    const response = await axios.get(`${API_BASE_URL}/current-user`, {
      withCredentials: true,
    });
    return response.data;
  },

  getAllPolicies: async () => {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  },

  getPolicyById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  createPolicy: async (policyData) => {
    const response = await axios.post(API_BASE_URL, policyData);
    return response.data;
  },

  updatePolicy: async (id, policyData) => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, policyData);
    return response.data;
  },

  deletePolicy: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  },
};