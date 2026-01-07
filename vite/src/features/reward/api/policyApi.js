import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/reward/policy';

// 전체 포상 정책 조회
export const getAllPolicies = async () => {
    try {
        const response = await axios.get(API_BASE_URL);
        return response.data;
    } catch (error) {
        console.error('포상 정책 조회 실패:', error);
        throw error;
    }
};

// ID로 포상 정책 조회
export const getPolicyById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('포상 정책 조회 실패:', error);
        throw error;
    }
};

// 활성화된 포상 정책만 조회
export const getActivePolicies = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/active`);
        return response.data;
    } catch (error) {
        console.error('활성화된 포상 정책 조회 실패:', error);
        throw error;
    }
};

// 포상 정책 생성
export const createPolicy = async (policyData) => {
    try {
        const response = await axios.post(API_BASE_URL, policyData);
        return response.data;
    } catch (error) {
        console.error('포상 정책 생성 실패:', error);
        throw error;
    }
};

// 포상 정책 수정
export const updatePolicy = async (id, policyData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/${id}`, policyData);
        return response.data;
    } catch (error) {
        console.error('포상 정책 수정 실패:', error);
        throw error;
    }
};

// 포상 정책 삭제
export const deletePolicy = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}/${id}`);
    } catch (error) {
        console.error('포상 정책 삭제 실패:', error);
        throw error;
    }
};

// 활성화 상태 토글
export const toggleActiveStatus = async (id) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/${id}/toggle-active`);
        return response.data;
    } catch (error) {
        console.error('활성화 상태 변경 실패:', error);
        throw error;
    }
};