import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/evaluation/criteria';

// 전체 평가 항목 조회
export const getAllCriteria = async () => {
    try {
        const response = await axios.get(API_BASE_URL);
        return response.data;
    } catch (error) {
        console.error('평가 항목 조회 실패:', error);
        throw error;
    }
};

// ID로 평가 항목 조회
export const getCriteriaById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('평가 항목 조회 실패:', error);
        throw error;
    }
};

// 평가 항목 생성
export const createCriteria = async (criteriaData) => {
    try {
        const response = await axios.post(API_BASE_URL, criteriaData);
        return response.data;
    } catch (error) {
        console.error('평가 항목 생성 실패:', error);
        throw error;
    }
};

// 평가 항목 수정
export const updateCriteria = async (id, criteriaData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/${id}`, criteriaData);
        return response.data;
    } catch (error) {
        console.error('평가 항목 수정 실패:', error);
        throw error;
    }
};

// 평가 항목 삭제
export const deleteCriteria = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}/${id}`);
    } catch (error) {
        console.error('평가 항목 삭제 실패:', error);
        throw error;
    }
};

// 가중치 수정
export const updateWeight = async (id, weight) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/${id}/weight`, null, {
            params: { weight }
        });
        return response.data;
    } catch (error) {
        console.error('가중치 수정 실패:', error);
        throw error;
    }
};