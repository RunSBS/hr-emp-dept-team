import axios from 'axios';

const API_BASE_URL = '/back/api/evaluation/results';

export const resultApi = {
  // 현재 로그인한 사용자의 평가 결과 조회
  getMyEvaluations: async () => {
    const response = await axios.get(`${API_BASE_URL}/my-evaluations`);
    return response.data;
  },

  // 특정 직원의 평가 결과 목록 조회
  getEvaluationsByEmpId: async (empId) => {
    const response = await axios.get(`${API_BASE_URL}/employee/${empId}`);
    return response.data;
  },

  // 특정 평가 결과 상세 조회
  getEvaluationById: async (evaluationId) => {
    const response = await axios.get(`${API_BASE_URL}/${evaluationId}`);
    return response.data;
  },

  // 특정 기간의 평가 결과 목록 조회
  getEvaluationsByPeriod: async (period) => {
    const response = await axios.get(`${API_BASE_URL}/period/${period}`);
    return response.data;
  },
};