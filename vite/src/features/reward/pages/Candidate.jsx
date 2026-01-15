import { useState, useEffect } from 'react';
import { candidateApi } from '../api/candidateApi';
import { policyApi } from '../api/policyApi';
import '../styles/Candidate.css';

const Candidate = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nominationType, setNominationType] = useState(null); // null, 'MANUAL', 'AI'

  // 수동 추천 관련
  const [policyList, setPolicyList] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [formData, setFormData] = useState({
    policyId: '',
    nomineeId: '',
    rewardAmount: '',
    reason: ''
  });
  const [myNominations, setMyNominations] = useState([]);

  useEffect(() => {
    checkPermissionAndLoadData();
  }, []);

  const checkPermissionAndLoadData = async () => {
    try {
      setLoading(true);

      // 현재 사용자 정보 조회
      const user = await candidateApi.getCurrentUser();
      setCurrentUser(user);
      console.log('[포상 추천] 현재 로그인 사용자:', user);

      // 권한 체크: empRole이 "CEO" 또는 "LEADER"인 경우만 추천 권한 부여
      const permission = await candidateApi.checkPermission();
      setHasPermission(permission);
      console.log('[포상 추천] 추천 권한 여부:', permission);

      if (permission) {
        // 내가 추천한 목록 조회
        await fetchMyNominations();
      }
    } catch (error) {
      console.error('[포상 추천] 데이터 로딩 실패:', error);
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyNominations = async () => {
    try {
      const data = await candidateApi.getMyNominations();
      setMyNominations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[포상 추천] 내 추천 목록 조회 실패:', error);
      setMyNominations([]);
    }
  };

  const handleSelectNominationType = async (type) => {
    if (type === 'AI') {
      alert('AI 추천 기능은 준비 중입니다.');
      return;
    }

    setNominationType(type);

    if (type === 'MANUAL') {
      // 포상 정책 목록과 추천 가능한 사원 목록 조회
      try {
        const [policies, nomineeList] = await Promise.all([
          policyApi.getAllPolicies(),
          candidateApi.getNominees()
        ]);
        setPolicyList(Array.isArray(policies) ? policies.filter(p => p.isActive === 'Y') : []);
        setNominees(Array.isArray(nomineeList) ? nomineeList : []);
        console.log('[포상 추천] 추천 가능한 사원 수:', nomineeList.length);
      } catch (error) {
        console.error('[포상 추천] 데이터 조회 실패:', error);
        alert('데이터 조회에 실패했습니다.');
      }
    }
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

    if (!formData.policyId) {
      alert('포상 정책을 선택해주세요.');
      return;
    }

    if (!formData.nomineeId) {
      alert('추천할 사원을 선택해주세요.');
      return;
    }

    if (!formData.rewardAmount || formData.rewardAmount <= 0) {
      alert('지급 값을 올바르게 입력해주세요.');
      return;
    }

    if (!formData.reason || !formData.reason.trim()) {
      alert('추천 사유를 입력해주세요.');
      return;
    }

    try {
      await candidateApi.nominateCandidate({
        policyId: formData.policyId,
        nomineeId: formData.nomineeId,
        nominationType: 'MANUAL',
        rewardAmount: parseInt(formData.rewardAmount),
        reason: formData.reason
      });

      alert('포상 후보가 성공적으로 추천되었습니다.');

      // 폼 초기화
      setFormData({
        policyId: '',
        nomineeId: '',
        rewardAmount: '',
        reason: ''
      });

      // 추천 목록 새로고침
      await fetchMyNominations();
    } catch (error) {
      console.error('[포상 추천] 추천 등록 실패:', error);
      alert('추천 등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleBackToSelection = () => {
    setNominationType(null);
    setFormData({
      policyId: '',
      nomineeId: '',
      rewardAmount: '',
      reason: ''
    });
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

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { label: '대기', className: 'status-pending' },
      'APPROVED': { label: '승인', className: 'status-approved' },
      'REJECTED': { label: '거부', className: 'status-rejected' }
    };
    const statusInfo = statusMap[status] || { label: status, className: '' };
    return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
  };

  if (loading) {
    return <div className="candidate-container">로딩 중...</div>;
  }

  if (!hasPermission) {
    return (
      <div className="candidate-container">
        <div className="no-permission">
          <h2>접근 권한이 없습니다</h2>
          <p>포상 후보 추천은 CEO와 팀 리더만 가능합니다.</p>
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

  // 추천 방식 선택 화면
  if (!nominationType) {
    return (
      <div className="candidate-container">
        <h1 className="candidate-title">포상 후보 추천</h1>

        <div className="nomination-type-selection">
          <h2>추천 방식을 선택하세요</h2>
          <div className="type-buttons">
            <button
              className="type-button manual-button"
              onClick={() => handleSelectNominationType('MANUAL')}
            >
              <div className="button-icon">👤</div>
              <div className="button-title">수동 추천</div>
              <div className="button-description">직접 사원을 선택하여 추천합니다</div>
            </button>
            <button
              className="type-button ai-button"
              onClick={() => handleSelectNominationType('AI')}
            >
              <div className="button-icon">🤖</div>
              <div className="button-title">AI 추천</div>
              <div className="button-description">AI가 최적의 후보를 추천합니다 (준비 중)</div>
            </button>
          </div>
        </div>

        {myNominations.length > 0 && (
          <div className="my-nominations-section">
            <h2>내가 추천한 후보 목록</h2>
            <div className="nominations-table-container">
              <table className="nominations-table">
                <thead>
                  <tr>
                    <th>피추천자</th>
                    <th>포상 정책</th>
                    <th>추천 사유</th>
                    <th>상태</th>
                    <th>추천일시</th>
                  </tr>
                </thead>
                <tbody>
                  {myNominations.map((nomination) => (
                    <tr key={nomination.candidateId}>
                      <td>{nomination.nomineeName}</td>
                      <td>{nomination.policyName}</td>
                      <td className="reason-cell">{nomination.reason}</td>
                      <td>{getStatusBadge(nomination.status)}</td>
                      <td>{formatDate(nomination.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 수동 추천 화면
  if (nominationType === 'MANUAL') {
    return (
      <div className="candidate-container">
        <div className="candidate-header">
          <h1 className="candidate-title">수동 포상 후보 추천</h1>
          <button className="back-button" onClick={handleBackToSelection}>
            ← 뒤로 가기
          </button>
        </div>

        <div className="manual-nomination-form-container">
          <form onSubmit={handleSubmit} className="manual-nomination-form">
            <div className="form-section">
              <h3>추천 정보 입력</h3>

              <div className="form-group">
                <label className="form-label">포상 정책 *</label>
                <select
                  name="policyId"
                  value={formData.policyId}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="">포상 정책을 선택하세요</option>
                  {policyList.map((policy) => (
                    <option key={policy.policyId} value={policy.policyId}>
                      {policy.policyName} ({policy.rewardType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">추천 사원 *</label>
                <select
                  name="nomineeId"
                  value={formData.nomineeId}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="">사원을 선택하세요</option>
                  {nominees.map((nominee) => (
                    <option key={nominee.empId} value={nominee.empId}>
                      {nominee.empName} ({nominee.empRole}) - {nominee.deptName || '부서 없음'}
                    </option>
                  ))}
                </select>
                {nominees.length === 0 && (
                  <p className="helper-text">추천 가능한 사원이 없습니다.</p>
                )}
                {currentUser && currentUser.empRole === 'CEO' && (
                  <p className="helper-text">CEO는 각 팀의 리더를 추천할 수 있습니다.</p>
                )}
                {currentUser && currentUser.empRole === 'LEADER' && (
                  <p className="helper-text">리더는 자신의 팀원을 추천할 수 있습니다.</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">지급 값 *</label>
                <input
                  type="number"
                  name="rewardAmount"
                  value={formData.rewardAmount}
                  onChange={handleInputChange}
                  className="form-select"
                  min="0"
                  placeholder="지급할 금액 또는 일수를 입력하세요"
                  required
                />
                <p className="helper-text">
                  선택한 포상 유형에 따라 금액(원) 또는 휴가(일)를 입력하세요.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">추천 사유 *</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows="5"
                  maxLength="500"
                  placeholder="추천 사유를 상세히 입력해주세요 (최대 500자)"
                  required
                />
                <div className="character-count">
                  {formData.reason.length} / 500
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button">
                  추천하기
                </button>
                <button type="button" className="cancel-button" onClick={handleBackToSelection}>
                  취소
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
};

export default Candidate;