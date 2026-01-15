import { useState, useEffect } from 'react';
import { policyApi } from '../api/policyApi';
import '../styles/Policy.css';

const Policy = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [policyList, setPolicyList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [formData, setFormData] = useState({
    policyName: '',
    rewardType: '',
    description: '',
    isActive: 'Y'
  });

  useEffect(() => {
    checkPermissionAndLoadData();
  }, []);

  const checkPermissionAndLoadData = async () => {
    try {
      setLoading(true);

      // 현재 사용자 정보 조회
      const user = await policyApi.getCurrentUser();
      setCurrentUser(user);
      console.log('[포상정책관리] 현재 로그인 사용자:', user);
      console.log('[포상정책관리] 사용자 포지션:', user.empRole);

      // 권한 체크: empRole이 "REWARD" 또는 "CEO"인 경우만 관리 권한 부여
      if (user.empRole === 'REWARD' || user.empRole === 'CEO') {
        setHasPermission(true);
        console.log('[포상정책관리] 포상 정책 관리 권한 있음');
      } else {
        setHasPermission(false);
        console.log('[포상정책관리] 포상 정책 관리 권한 없음');
      }

      // 포상 정책 목록 조회 (권한 관계없이 모두 조회 가능)
      await fetchPolicies();
    } catch (error) {
      console.error('[포상정책관리] 데이터 로딩 실패:', error);
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchPolicies = async () => {
    try {
      const data = await policyApi.getAllPolicies();
      console.log('API Response:', data);
      setPolicyList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('포상 정책 조회 실패:', error);
      setPolicyList([]);
      alert('포상 정책 조회에 실패했습니다.');
    }
  };

  const handleOpenModal = (policy = null) => {
    if (policy) {
      setEditingPolicy(policy);
      setFormData({
        policyName: policy.policyName,
        rewardType: policy.rewardType,
        description: policy.description || '',
        isActive: policy.isActive
      });
    } else {
      setEditingPolicy(null);
      setFormData({
        policyName: '',
        rewardType: '',
        description: '',
        isActive: 'Y'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPolicy(null);
    setFormData({
      policyName: '',
      rewardType: '',
      description: '',
      isActive: 'Y'
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

    if (!formData.policyName.trim()) {
      alert('정책명을 입력해주세요.');
      return;
    }

    if (!formData.rewardType.trim()) {
      alert('포상 유형을 입력해주세요.');
      return;
    }

    try {
      if (editingPolicy) {
        await policyApi.updatePolicy(editingPolicy.policyId, formData);
        alert('포상 정책이 수정되었습니다.');
      } else {
        await policyApi.createPolicy(formData);
        alert('포상 정책이 추가되었습니다.');
      }
      handleCloseModal();
      fetchPolicies();
    } catch (error) {
      console.error('포상 정책 저장 실패:', error);
      alert('포상 정책 저장에 실패했습니다.');
    }
  };

  const handleDelete = async (policyId) => {
    if (!window.confirm('이 포상 정책을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await policyApi.deletePolicy(policyId);
      alert('포상 정책이 삭제되었습니다.');
      handleCloseModal();
      fetchPolicies();
    } catch (error) {
      console.error('포상 정책 삭제 실패:', error);
      alert('포상 정책 삭제에 실패했습니다.');
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
    return <div className="reward-policy-container">로딩 중...</div>;
  }

  if (!hasPermission) {
    return (
      <div className="reward-policy-container">
        <div className="no-permission">
          <h2>접근 권한이 없습니다</h2>
          <p>포상 정책 관리는 포상관리자와 CEO만 가능합니다.</p>
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
    <div className="reward-policy-container">
      <div className="reward-policy-header">
        <h1 className="reward-policy-title">포상 정책 관리</h1>
        <button className="reward-policy-add-button" onClick={() => handleOpenModal()}>
          + 포상 정책 추가
        </button>
      </div>

      <div className="reward-policy-table-container">
        <table className="reward-policy-table">
          <thead>
            <tr>
              <th>정책명</th>
              <th>포상 유형</th>
              <th>설명</th>
              <th>활성화 여부</th>
              <th>생성일시</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {policyList.length === 0 ? (
              <tr>
                <td colSpan="6" className="reward-policy-empty-message">
                  등록된 포상 정책이 없습니다.
                </td>
              </tr>
            ) : (
              policyList.map((policy) => (
                <tr key={policy.policyId}>
                  <td>{policy.policyName}</td>
                  <td>{policy.rewardType}</td>
                  <td>{policy.description || '-'}</td>
                  <td>
                    <span className={policy.isActive === 'Y' ? 'reward-policy-active-badge' : 'reward-policy-inactive-badge'}>
                      {policy.isActive === 'Y' ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td>{formatDate(policy.createdAt)}</td>
                  <td>
                    <button
                      className="reward-policy-edit-button"
                      onClick={() => handleOpenModal(policy)}
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
        <div className="reward-policy-modal-overlay" onClick={handleCloseModal}>
          <div className="reward-policy-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="reward-policy-modal-title">
              {editingPolicy ? '포상 정책 수정' : '포상 정책 추가'}
            </h2>
            <form onSubmit={handleSubmit} className="reward-policy-form">
              <div className="reward-policy-form-group">
                <label className="reward-policy-label">정책명 *</label>
                <input
                  type="text"
                  name="policyName"
                  value={formData.policyName}
                  onChange={handleInputChange}
                  className="reward-policy-input"
                  maxLength="100"
                  required
                />
              </div>

              <div className="reward-policy-form-group">
                <label className="reward-policy-label">포상 유형 *</label>
                <input
                  type="text"
                  name="rewardType"
                  value={formData.rewardType}
                  onChange={handleInputChange}
                  className="reward-policy-input"
                  maxLength="50"
                  required
                />
              </div>

              <div className="reward-policy-form-group">
                <label className="reward-policy-label">설명</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="reward-policy-textarea"
                  maxLength="255"
                  rows="4"
                />
              </div>

              <div className="reward-policy-form-group">
                <label className="reward-policy-label">활성화 여부 *</label>
                <select
                  name="isActive"
                  value={formData.isActive}
                  onChange={handleInputChange}
                  className="reward-policy-input"
                  required
                >
                  <option value="Y">활성</option>
                  <option value="N">비활성</option>
                </select>
              </div>

              <div className="reward-policy-button-group">
                {editingPolicy && (
                  <button
                    type="button"
                    className="reward-policy-delete-button"
                    onClick={() => handleDelete(editingPolicy.policyId)}
                  >
                    삭제
                  </button>
                )}
                <div className="reward-policy-right-buttons">
                  <button type="submit" className="reward-policy-submit-button">
                    {editingPolicy ? '수정' : '추가'}
                  </button>
                  <button
                    type="button"
                    className="reward-policy-cancel-button"
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

export default Policy;