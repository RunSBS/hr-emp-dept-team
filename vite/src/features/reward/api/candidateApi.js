import axios from 'axios';

const API_BASE_URL = '/back/api/reward/candidate';

export const candidateApi = {
  // 현재 로그인 사용자 정보 조회
  getCurrentUser: async () => {
    const response = await axios.get(`${API_BASE_URL}/current-user`, {
      withCredentials: true,
    });
    return response.data;
  },

  // 추천 권한 체크
  checkPermission: async () => {
    const response = await axios.get(`${API_BASE_URL}/permission`, {
      withCredentials: true,
    });
    return response.data;
  },

  // 추천 가능한 사원 목록 조회
  getNominees: async () => {
    const response = await axios.get(`${API_BASE_URL}/nominees`, {
      withCredentials: true,
    });
    return response.data;
  },

  // 포상 후보 추천 등록
  nominateCandidate: async (candidateData) => {
    const response = await axios.post(API_BASE_URL, candidateData, {
      withCredentials: true,
    });
    return response.data;
  },

  // 내가 추천한 후보 목록 조회
  getMyNominations: async () => {
    const response = await axios.get(`${API_BASE_URL}/my-nominations`, {
      withCredentials: true,
    });
    return response.data;
  },

  // 전체 추천 목록 조회
  getAllCandidates: async () => {
    const response = await axios.get(`${API_BASE_URL}/all`, {
      withCredentials: true,
    });
    return response.data;
  },

  // 본인의 승인된 포상 이력 조회
  getMyApprovedRewards: async () => {
    const response = await axios.get(`${API_BASE_URL}/my-rewards`, {
      withCredentials: true,
    });
    return response.data;
  },

  // ==================== AI 추천 API ====================

  // AI 추천 후보 목록 조회
  getAiRecommendations: async () => {
    const response = await axios.get(`${API_BASE_URL}/ai-recommendations`, {
      withCredentials: true,
    });
    return response.data;
  },

  // 특정 직원 AI 추천 상세 조회
  getAiRecommendationDetail: async (empId) => {
    const response = await axios.get(`${API_BASE_URL}/ai-recommendations/${empId}`, {
      withCredentials: true,
    });
    return response.data;
  },

  // AI 추천 기반 포상 후보 등록
  nominateFromAi: async (nominationData) => {
    const response = await axios.post(`${API_BASE_URL}/ai-nominate`, nominationData, {
      withCredentials: true,
    });
    return response.data;
  },
};