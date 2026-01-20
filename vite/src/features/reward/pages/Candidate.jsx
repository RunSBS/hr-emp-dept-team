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

  // AI 추천 관련
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStarted, setAiStarted] = useState(false);  // AI 추천 시작 여부
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);
  const [aiFormData, setAiFormData] = useState({
    rewardAmount: '',
    reason: ''
  });

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
    } else if (type === 'AI') {
      // AI 추천 화면으로 이동 (바로 추천 시작하지 않음)
      setAiStarted(false);
      setAiRecommendations([]);
    }
  };

  const fetchAiRecommendations = async () => {
    try {
      setAiLoading(true);
      setAiStarted(true);
      const recommendations = await candidateApi.getAiRecommendations();
      setAiRecommendations(Array.isArray(recommendations) ? recommendations : []);
      console.log('[AI 추천] 추천 후보 수:', recommendations.length);
    } catch (error) {
      console.error('[AI 추천] 조회 실패:', error);
      alert('AI 추천 조회에 실패했습니다.');
      setAiRecommendations([]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleStartAiRecommendation = () => {
    fetchAiRecommendations();
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
    setSelectedRecommendation(null);
    setSelectedReward(null);
    setAiFormData({
      rewardAmount: '',
      reason: ''
    });
  };

  // AI 추천 관련 핸들러
  const handleSelectRecommendation = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setSelectedReward(null);
    setAiFormData({
      rewardAmount: '',
      reason: recommendation.overallRecommendReason || ''
    });
  };

  const handleSelectReward = (reward) => {
    setSelectedReward(reward);
    setAiFormData(prev => ({
      ...prev,
      reason: `[AI 추천] ${reward.matchReason}\n\n${selectedRecommendation.overallRecommendReason || ''}`
    }));
  };

  const handleAiFormChange = (e) => {
    const { name, value } = e.target;
    setAiFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAiSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRecommendation || !selectedReward) {
      alert('추천 대상과 포상 항목을 선택해주세요.');
      return;
    }

    if (!aiFormData.rewardAmount || aiFormData.rewardAmount <= 0) {
      alert('지급 값을 올바르게 입력해주세요.');
      return;
    }

    if (!aiFormData.reason || !aiFormData.reason.trim()) {
      alert('추천 사유를 입력해주세요.');
      return;
    }

    try {
      await candidateApi.nominateFromAi({
        nomineeId: selectedRecommendation.empId,
        policyId: selectedReward.policyId,
        rewardAmount: parseInt(aiFormData.rewardAmount),
        reason: aiFormData.reason
      });

      alert('AI 기반 포상 추천이 성공적으로 등록되었습니다.');

      // 상태 초기화
      setSelectedRecommendation(null);
      setSelectedReward(null);
      setAiFormData({
        rewardAmount: '',
        reason: ''
      });

      // 추천 목록 새로고침
      await fetchMyNominations();
      await fetchAiRecommendations();
    } catch (error) {
      console.error('[AI 추천] 등록 실패:', error);
      alert('추천 등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleBackToAiList = () => {
    setSelectedRecommendation(null);
    setSelectedReward(null);
    setAiFormData({
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

  const getScoreColor = (score) => {
    if (score >= 90) return 'score-excellent';
    if (score >= 85) return 'score-good';
    if (score >= 80) return 'score-average';
    return 'score-below';
  };

  const getMatchScoreBar = (score) => {
    let colorClass = 'match-low';
    if (score >= 80) colorClass = 'match-high';
    else if (score >= 60) colorClass = 'match-medium';

    return (
      <div className="match-score-bar">
        <div className={`match-score-fill ${colorClass}`} style={{ width: `${score}%` }}></div>
        <span className="match-score-text">{score}%</span>
      </div>
    );
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
              <div className="button-icon">✋</div>
              <div className="button-title">수동 추천</div>
              <div className="button-description">직접 사원을 선택하여 추천합니다</div>
            </button>
            <button
              className="type-button ai-button"
              onClick={() => handleSelectNominationType('AI')}
            >
              <div className="button-icon">🎰</div>
              <div className="button-title">AI 추천</div>
              <div className="button-description">평가 점수와 코멘트 기반 AI 추천</div>
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
                    <th>추천 대상</th>
                    <th>포상 정책</th>
                    <th>추천 방식</th>
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
                      <td>
                        <span className={`nomination-type-badge ${nomination.nominationType === 'AI' ? 'type-ai' : 'type-manual'}`}>
                          {nomination.nominationType === 'AI' ? '🎰 AI' : '✋ 수동'}
                        </span>
                      </td>
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

  // AI 추천 화면
  if (nominationType === 'AI') {
    // AI 추천 상세 화면 (후보 선택 후)
    if (selectedRecommendation) {
      return (
        <div className="candidate-container">
          <div className="candidate-header">
            <h1 className="candidate-title">AI 추천 상세</h1>
            <button className="back-button" onClick={handleBackToAiList}>
              ← 목록으로
            </button>
          </div>

          <div className="ai-detail-container">
            {/* 직원 정보 카드 */}
            <div className="ai-employee-card">
              <div className="employee-info-header">
                <div className="employee-avatar">
                  {selectedRecommendation.empName?.charAt(0)}
                </div>
                <div className="employee-basic-info">
                  <h2>{selectedRecommendation.empName}</h2>
                  <p>{selectedRecommendation.deptName} / {selectedRecommendation.empRole}</p>
                </div>
                <div className={`employee-score ${getScoreColor(selectedRecommendation.avgScore)}`}>
                  <span className="score-label">평균 점수</span>
                  <span className="score-value">{selectedRecommendation.avgScore}</span>
                </div>
              </div>

              <div className="ai-reason-box">
                <h4>AI 분석 결과</h4>
                <p>{selectedRecommendation.overallRecommendReason}</p>
              </div>

              {selectedRecommendation.latestComment && (
                <div className="latest-comment-box">
                  <h4>최근 평가 코멘트</h4>
                  <p>"{selectedRecommendation.latestComment}"</p>
                </div>
              )}

              {selectedRecommendation.newRewardSuggestion && (
                <div className="new-reward-suggestion">
                  <h4>💡 새로운 포상 제안</h4>
                  <p>{selectedRecommendation.newRewardSuggestion}</p>
                </div>
              )}
            </div>

            {/* 추천 포상 목록 */}
            <div className="ai-rewards-section">
              <h3>추천 포상 항목</h3>
              <div className="ai-rewards-list">
                {selectedRecommendation.recommendedRewards?.map((reward, index) => (
                  <div
                    key={reward.policyId}
                    className={`ai-reward-card ${selectedReward?.policyId === reward.policyId ? 'selected' : ''}`}
                    onClick={() => handleSelectReward(reward)}
                  >
                    <div className="reward-rank">#{index + 1}</div>
                    <div className="reward-info">
                      <h4>{reward.policyName}</h4>
                      <p className="reward-type">{reward.rewardType}</p>
                      <p className="reward-reason">{reward.matchReason}</p>
                      {reward.matchedKeywords?.length > 0 && (
                        <div className="matched-keywords">
                          {reward.matchedKeywords.map((keyword, idx) => (
                            <span key={idx} className="keyword-tag">{keyword}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="reward-match-score">
                      <span className="match-label">매칭도</span>
                      {getMatchScoreBar(reward.matchScore)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 추천 등록 폼 */}
            {selectedReward && (
              <div className="ai-nomination-form">
                <h3>포상 추천 등록</h3>
                <form onSubmit={handleAiSubmit}>
                  <div className="selected-info">
                    <p><strong>추천 대상:</strong> {selectedRecommendation.empName}</p>
                    <p><strong>선택 포상:</strong> {selectedReward.policyName} ({selectedReward.rewardType})</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">지급 값 *</label>
                    <input
                      type="number"
                      name="rewardAmount"
                      value={aiFormData.rewardAmount}
                      onChange={handleAiFormChange}
                      className="form-select"
                      min="0"
                      placeholder="지급할 금액 또는 일수를 입력하세요"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">추천 사유 *</label>
                    <textarea
                      name="reason"
                      value={aiFormData.reason}
                      onChange={handleAiFormChange}
                      className="form-textarea"
                      rows="5"
                      maxLength="500"
                      placeholder="AI가 생성한 사유를 수정하거나 추가 내용을 입력하세요"
                      required
                    />
                    <div className="character-count">
                      {aiFormData.reason.length} / 500
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="submit-button ai-submit">
                      🤖 AI 추천으로 등록
                    </button>
                    <button type="button" className="cancel-button" onClick={handleBackToAiList}>
                      취소
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      );
    }

    // AI 추천 목록 화면
    return (
      <div className="candidate-container">
        <div className="candidate-header">
          <h1 className="candidate-title">AI 포상 추천</h1>
          <button className="back-button" onClick={handleBackToSelection}>
            ← 뒤로 가기
          </button>
        </div>

        <div className="ai-info-banner">
          <div className="info-icon">💡</div>
          <div className="info-content">
            <h4>AI 추천 시스템</h4>
            <p>평가 점수와 코멘트를 분석하여 포상 후보를 자동으로 추천합니다. 추천 결과를 검토하고 적합한 포상을 선택해주세요.</p>
          </div>
        </div>

        {aiLoading ? (
          <div className="ai-loading">
            <div className="loading-spinner"></div>
            <p>AI가 추천 후보를 분석하고 있습니다...</p>
          </div>
        ) : !aiStarted ? (
          <div className="ai-start-section">
            <div className="ai-start-icon">🎰</div>
            <h3>AI 추천 시작</h3>
            <p>평가 점수와 코멘트를 분석하여 포상 후보를 추천</p>
            <button className="ai-start-button" onClick={handleStartAiRecommendation}>
              추천 시작
            </button>
          </div>
        ) : aiRecommendations.length === 0 ? (
          <div className="no-recommendations">
            <div className="no-data-icon">📊</div>
            <h3>추천 가능한 후보가 없습니다</h3>
            <p>평가 데이터가 있는 직원이 없거나, 추천 기준을 충족하는 직원이 없습니다.</p>
          </div>
        ) : (
          <div className="ai-recommendations-grid">
            {aiRecommendations.map((rec) => (
              <div
                key={rec.empId}
                className="ai-recommendation-card"
                onClick={() => handleSelectRecommendation(rec)}
              >
                <div className="card-header">
                  <div className="employee-avatar">{rec.empName?.charAt(0)}</div>
                  <div className="employee-info">
                    <h3>{rec.empName}</h3>
                    <p>{rec.deptName} / {rec.empRole}</p>
                  </div>
                  <div className={`score-badge ${getScoreColor(rec.avgScore)}`}>
                    {rec.avgScore}점
                  </div>
                </div>

                <div className="card-body">
                  <div className="recommended-rewards-preview">
                    <h4>추천 포상</h4>
                    <ul>
                      {rec.recommendedRewards?.slice(0, 2).map((reward) => (
                        <li key={reward.policyId}>
                          <span className="reward-name">{reward.policyName}</span>
                          <span className="reward-match">{reward.matchScore}%</span>
                        </li>
                      ))}
                      {rec.recommendedRewards?.length > 2 && (
                        <li className="more-rewards">+{rec.recommendedRewards.length - 2}개 더</li>
                      )}
                    </ul>
                  </div>

                  {rec.newRewardSuggestion && (
                    <div className="new-suggestion-badge">
                      💡 새 포상 제안 있음
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <button className="view-detail-button">
                    상세 보기 →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default Candidate;