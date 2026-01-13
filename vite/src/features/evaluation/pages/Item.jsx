import { useState, useEffect } from 'react';
import { criteriaApi } from '../api/criteriaApi';
import '../styles/Item.css';

const Item = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [criteriaList, setCriteriaList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState(null);
  const [formData, setFormData] = useState({
    criteriaName: '',
    weight: '',
    description: ''
  });

  useEffect(() => {
    checkPermissionAndLoadData();
  }, []);

  const checkPermissionAndLoadData = async () => {
    try {
      setLoading(true);

      // 현재 사용자 정보 조회
      const user = await criteriaApi.getCurrentUser();
      setCurrentUser(user);
      console.log('[평가항목관리] 현재 로그인 사용자:', user);
      console.log('[평가항목관리] 사용자 포지션:', user.empRole);

      // 권한 체크: empRole이 "EVAL" 또는 "CEO"인 경우만 관리 권한 부여
      if (user.empRole === 'EVAL' || user.empRole === 'CEO') {
        setHasPermission(true);
        console.log('[평가항목관리] 평가 항목 관리 권한 있음');
      } else {
        setHasPermission(false);
        console.log('[평가항목관리] 평가 항목 관리 권한 없음');
      }

      // 평가 항목 목록 조회 (권한 관계없이 모두 조회 가능)
      await fetchCriteria();
    } catch (error) {
      console.error('[평가항목관리] 데이터 로딩 실패:', error);
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchCriteria = async () => {
    try {
      const data = await criteriaApi.getAllCriteria();
      console.log('[평가항목관리] API Response:', data);
      setCriteriaList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[평가항목관리] 평가 항목 조회 실패:', error);
      setCriteriaList([]);
      alert('평가 항목 조회에 실패했습니다.');
    }
  };

  const handleOpenModal = (criteria = null) => {
    if (criteria) {
      setEditingCriteria(criteria);
      setFormData({
        criteriaName: criteria.criteriaName,
        weight: criteria.weight,
        description: criteria.description || ''
      });
    } else {
      setEditingCriteria(null);
      setFormData({
        criteriaName: '',
        weight: '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCriteria(null);
    setFormData({
      criteriaName: '',
      weight: '',
      description: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.criteriaName.trim()) {
      alert('평가 항목명을 입력해주세요.');
      return;
    }

    if (!formData.weight || formData.weight <= 0 || formData.weight > 999) {
      alert('가중치는 1-999 사이의 값을 입력해주세요.');
      return;
    }

    try {
      if (editingCriteria) {
        await criteriaApi.updateCriteria(editingCriteria.criteriaId, formData);
        alert('평가 항목이 수정되었습니다.');
      } else {
        await criteriaApi.createCriteria(formData);
        alert('평가 항목이 추가되었습니다.');
      }
      handleCloseModal();
      fetchCriteria();
    } catch (error) {
      console.error('평가 항목 저장 실패:', error);
      alert('평가 항목 저장에 실패했습니다.');
    }
  };

  const handleDelete = async (criteriaId) => {
    if (!window.confirm('이 평가 항목을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await criteriaApi.deleteCriteria(criteriaId);
      alert('평가 항목이 삭제되었습니다.');
      handleCloseModal();
      fetchCriteria();
    } catch (error) {
      console.error('평가 항목 삭제 실패:', error);
      alert('평가 항목 삭제에 실패했습니다.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="eval-item-container">로딩 중...</div>;
  }

  if (!hasPermission) {
    return (
      <div className="eval-item-container">
        <div className="no-permission">
          <h2>접근 권한이 없습니다</h2>
          <p>평가 항목 관리는 관리관과 CEO만 가능합니다.</p>
          {currentUser && (
            <div className="user-info">
              <p>현재 사용자: {currentUser.empName}</p>
              <p>직급: {currentUser.empRole}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="eval-item-container">
      <div className="eval-item-header">
        <h1 className="eval-item-title">평가 항목 관리</h1>
        <button className="eval-item-add-button" onClick={() => handleOpenModal()}>
          + 평가 항목 추가
        </button>
      </div>

      <div className="eval-item-table-container">
        <table className="eval-item-table">
          <thead>
            <tr>
              <th>평가 항목명</th>
              <th>가중치</th>
              <th>설명</th>
              <th>생성일시</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {criteriaList.length === 0 ? (
              <tr>
                <td colSpan="5" className="eval-item-empty-message">
                  등록된 평가 항목이 없습니다.
                </td>
              </tr>
            ) : (
              criteriaList.map((criteria) => (
                <tr key={criteria.criteriaId}>
                  <td>{criteria.criteriaName}</td>
                  <td>{criteria.weight}%</td>
                  <td>{criteria.description || '-'}</td>
                  <td>{formatDate(criteria.createdAt)}</td>
                  <td>
                    <button
                      className="eval-item-edit-button"
                      onClick={() => handleOpenModal(criteria)}
                    >
                      수정
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="eval-item-modal-overlay" onClick={handleCloseModal}>
          <div className="eval-item-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="eval-item-modal-title">
              {editingCriteria ? '평가 항목 수정' : '평가 항목 추가'}
            </h2>
            <form onSubmit={handleSubmit} className="eval-item-form">
              <div className="eval-item-form-group">
                <label className="eval-item-label">평가 항목명 *</label>
                <input
                  type="text"
                  name="criteriaName"
                  value={formData.criteriaName}
                  onChange={handleInputChange}
                  className="eval-item-input"
                  maxLength="50"
                  required
                />
              </div>

              <div className="eval-item-form-group">
                <label className="eval-item-label">가중치 *</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="eval-item-input"
                  min="1"
                  max="999"
                  required
                />
              </div>

              <div className="eval-item-form-group">
                <label className="eval-item-label">설명</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="eval-item-textarea"
                  maxLength="255"
                  rows="4"
                />
              </div>

              <div className="eval-item-button-group">
                {editingCriteria && (
                  <button
                    type="button"
                    className="eval-item-delete-button"
                    onClick={() => handleDelete(editingCriteria.criteriaId)}
                  >
                    삭제
                  </button>
                )}
                <div className="eval-item-right-buttons">
                  <button type="submit" className="eval-item-submit-button">
                    {editingCriteria ? '수정' : '추가'}
                  </button>
                  <button
                    type="button"
                    className="eval-item-cancel-button"
                    onClick={handleCloseModal}
                  >
                    취소
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Item;