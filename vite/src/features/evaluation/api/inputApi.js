import axios from 'axios';

const API_BASE_URL = '/back/api/evaluation/input';

export const inputApi = {
  // 현재 로그인 사용자 정보 조회
  getCurrentUser: async () => {
    const response = await axios.get(`${API_BASE_URL}/current-user`, {
      withCredentials: true,
    });
    return response.data;
  },

  // 평가 대상자 목록 조회
  getEvaluationTargets: async () => {
    const response = await axios.get(`${API_BASE_URL}/targets`, {
      withCredentials: true,
    });
    return response.data;
  },

  // 평가 입력
  createEvaluation: async (evaluationData) => {
    const response = await axios.post(API_BASE_URL, evaluationData, {
      withCredentials: true,
    });
    return response.data;
  },

  // 내가 입력한 평가 목록 조회
  getMyInputEvaluations: async () => {
    const response = await axios.get(`${API_BASE_URL}/my-inputs`, {
      withCredentials: true,
    });
    return response.data;
  },

  // 평가 상세 조회 (수정용)
  getEvaluationForEdit: async (evaluationId) => {
    const response = await axios.get(`${API_BASE_URL}/${evaluationId}`, {
      withCredentials: true,
    });
    return response.data;
  },

  // 평가 수정
  updateEvaluation: async (evaluationId, evaluationData) => {
    const response = await axios.put(`${API_BASE_URL}/${evaluationId}`, evaluationData, {
      withCredentials: true,
    });
    return response.data;
  },

  // 평가 삭제
  deleteEvaluation: async (evaluationId) => {
    const response = await axios.delete(`${API_BASE_URL}/${evaluationId}`, {
      withCredentials: true,
    });
    return response.data;
  },
};