import { useState, useEffect } from 'react';
import { inputApi } from '../api/inputApi';
import { criteriaApi } from '../api/criteriaApi';
import '../styles/Input.css';

const Input = () => {
  const [activeTab, setActiveTab] = useState('input'); // 'input' or 'manage'
  const [currentUser, setCurrentUser] = useState(null);
  const [targets, setTargets] = useState([]);
  const [criteriaList, setCriteriaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  // 입력한 평가 목록
  const [myEvaluations, setMyEvaluations] = useState([]);
  const [editingEvaluationId, setEditingEvaluationId] = useState(null);

  const [formData, setFormData] = useState({
    empId: '',
    evaluationPeriod: '',
    comment: '',
    scores: [],
  });

  useEffect(() => {
    checkPermissionAndLoadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'manage' && hasPermission) {
      loadMyEvaluations();
    }
  }, [activeTab, hasPermission]);

  const checkPermissionAndLoadData = async () => {
    try {
      setLoading(true);

      // 현재 사용자 정보 조회
      const user = await inputApi.getCurrentUser();
      setCurrentUser(user);
      console.log('[평가입력] 현재 로그인 사용자:', user);
      console.log('[평가입력] 사용자 포지션:', user.empRole);

      // 권한 체크: CEO 또는 LEADER만 접근 가능
      if (user.empRole === 'CEO' || user.empRole === 'LEADER') {
        setHasPermission(true);
        console.log('[평가입력] 평가 입력 권한 있음');

        // 평가 대상자 목록 조회
        const targetList = await inputApi.getEvaluationTargets();
        setTargets(targetList);
        console.log('[평가입력] 평가 대상자 목록:', targetList);

        // 평가 항목 조회
        const criteria = await criteriaApi.getAllCriteria();
        setCriteriaList(criteria);
        console.log('[평가입력] 평가 항목 목록:', criteria);

        // 점수 초기화
        const initialScores = criteria.map((c) => ({
          criteriaId: c.criteriaId,
          score: 0,
        }));
        setFormData((prev) => ({ ...prev, scores: initialScores }));
      } else {
        setHasPermission(false);
        console.log('[평가입력] 평가 입력 권한 없음');
      }
    } catch (error) {
      console.error('[평가입력] 데이터 로딩 실패:', error);
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMyEvaluations = async () => {
    try {
      console.log('[평가입력] 입력한 평가 목록 조회 시작');
      const evaluations = await inputApi.getMyInputEvaluations();
      setMyEvaluations(evaluations);
      console.log('[평가입력] 입력한 평가 목록:', evaluations);
    } catch (error) {
      console.error('[평가입력] 평가 목록 조회 실패:', error);
      alert('평가 목록 조회에 실패했습니다.');
    }
  };

  const handleEdit = async (evaluationId) => {
    try {
      console.log('[평가입력] 평가 수정 시작 - ID:', evaluationId);
      const evaluation = await inputApi.getEvaluationForEdit(evaluationId);
      console.log('[평가입력] 평가 상세 조회 결과:', evaluation);

      setFormData({
        empId: evaluation.empId,
        evaluationPeriod: evaluation.evaluationPeriod,
        comment: evaluation.comment || '',
        scores: evaluation.scores,
      });
      setEditingEvaluationId(evaluationId);
      setActiveTab('input');
    } catch (error) {
      console.error('[평가입력] 평가 조회 실패:', error);
      alert('평가 조회에 실패했습니다.');
    }
  };

  const handleDelete = async (evaluationId) => {
    if (!window.confirm('이 평가를 삭제하시겠습니까?')) {
      return;
    }

    try {
      console.log('[평가입력] 평가 삭제 시작 - ID:', evaluationId);
      await inputApi.deleteEvaluation(evaluationId);
      alert('평가가 성공적으로 삭제되었습니다.');
      console.log('[평가입력] 평가 삭제 완료 - ID:', evaluationId);
      loadMyEvaluations();
    } catch (error) {
      console.error('[평가입력] 평가 삭제 실패:', error);
      alert('평가 삭제에 실패했습니다.');
    }
  };

  const handleCancelEdit = () => {
    setEditingEvaluationId(null);
    setFormData({
      empId: '',
      evaluationPeriod: '',
      comment: '',
      scores: criteriaList.map((c) => ({
        criteriaId: c.criteriaId,
        score: 0,
      })),
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScoreChange = (criteriaId, score) => {
    setFormData((prev) => ({
      ...prev,
      scores: prev.scores.map((s) =>
        s.criteriaId === criteriaId ? { ...s, score: parseInt(score) || 0 } : s
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.empId) {
      alert('평가 대상자를 선택해주세요.');
      return;
    }

    if (!formData.evaluationPeriod) {
      alert('평가 기간을 입력해주세요.');
      return;
    }

    try {
      const submitData = {
        empId: formData.empId,
        evaluatorId: currentUser.empId,
        evaluationPeriod: formData.evaluationPeriod,
        comment: formData.comment,
        scores: formData.scores,
      };

      if (editingEvaluationId) {
        // 수정
        console.log('[평가입력] 평가 수정 요청 - ID:', editingEvaluationId);
        await inputApi.updateEvaluation(editingEvaluationId, submitData);
        alert('평가가 성공적으로 수정되었습니다.');
        setEditingEvaluationId(null);
      } else {
        // 신규 등록
        console.log('[평가입력] 평가 등록 요청');
        await inputApi.createEvaluation(submitData);
        alert('평가가 성공적으로 등록되었습니다.');
      }

      // 폼 초기화
      setFormData({
        empId: '',
        evaluationPeriod: '',
        comment: '',
        scores: criteriaList.map((c) => ({
          criteriaId: c.criteriaId,
          score: 0,
        })),
      });

      // 관리 탭이었다면 목록 새로고침
      if (activeTab === 'manage') {
        loadMyEvaluations();
      }
    } catch (error) {
      console.error('[평가입력] 평가 저장 실패:', error);
      alert('평가 저장에 실패했습니다.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  if (loading) {
    return <div className="input-container">로딩 중...</div>;
  }

  if (!hasPermission) {
    return (
      <div className="input-container">
        <div className="no-permission">
          <h2>접근 권한이 없습니다</h2>
          <p>평가 입력은 CEO 또는 LEADER만 가능합니다.</p>
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
    <div className="input-container">
      <h1>사원 평가</h1>

      <div className="user-info-box">
        <p>평가자: {currentUser.empName} ({currentUser.empRole})</p>
      </div>

      {/* 탭 메뉴 */}
      <div className="tab-menu">
        <button
          className={`tab-button ${activeTab === 'input' ? 'active' : ''}`}
          onClick={() => setActiveTab('input')}
        >
          평가 입력
        </button>
        <button
          className={`tab-button ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          입력한 평가 관리
        </button>
      </div>

      {/* 평가 입력 탭 */}
      {activeTab === 'input' && (
        <div className="tab-content">
          {editingEvaluationId && (
            <div className="edit-mode-notice">
              <p>평가 수정 모드입니다.</p>
              <button onClick={handleCancelEdit} className="cancel-edit-button">
                수정 취소
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="evaluation-form">
            {/* 평가 대상자 선택 */}
            <div className="form-group">
              <label htmlFor="empId">평가 대상자 *</label>
              <select
                id="empId"
                name="empId"
                value={formData.empId}
                onChange={handleInputChange}
                disabled={editingEvaluationId}
                required
              >
                <option value="">선택해주세요</option>
                {targets.map((target) => (
                  <option key={target.id} value={target.empId}>
                    {target.empName} ({target.empRole}) - 사번: {target.empId}
                  </option>
                ))}
              </select>
            </div>

            {/* 평가 기간 */}
            <div className="form-group">
              <label htmlFor="evaluationPeriod">평가 기간 *</label>
              <input
                type="text"
                id="evaluationPeriod"
                name="evaluationPeriod"
                value={formData.evaluationPeriod}
                onChange={handleInputChange}
                placeholder="예: 2025년 1분기"
                required
              />
            </div>

            {/* 평가 항목별 점수 */}
            <div className="form-group">
              <label>평가 항목별 점수 (0-100점)</label>
              <div className="criteria-scores">
                {criteriaList.map((criteria) => {
                  const currentScore =
                    formData.scores.find((s) => s.criteriaId === criteria.criteriaId)?.score || 0;
                  return (
                    <div key={criteria.criteriaId} className="criteria-item">
                      <div className="criteria-header">
                        <span className="criteria-name">{criteria.criteriaName}</span>
                        <span className="criteria-weight">가중치: {criteria.weight}%</span>
                      </div>
                      <div className="criteria-description">{criteria.description}</div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={currentScore}
                        onChange={(e) =>
                          handleScoreChange(criteria.criteriaId, e.target.value)
                        }
                        className="score-input"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 평가 의견 */}
            <div className="form-group">
              <label htmlFor="comment">평가 의견</label>
              <textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                rows="5"
                placeholder="평가 의견을 입력해주세요"
              />
            </div>

            <button type="submit" className="submit-button">
              {editingEvaluationId ? '평가 수정' : '평가 등록'}
            </button>
          </form>
        </div>
      )}

      {/* 입력한 평가 관리 탭 */}
      {activeTab === 'manage' && (
        <div className="tab-content">
          <h2>입력한 평가 목록</h2>
          {myEvaluations.length === 0 ? (
            <p className="no-data">입력한 평가가 없습니다.</p>
          ) : (
            <div className="evaluation-list">
              <table className="evaluation-table">
                <thead>
                  <tr>
                    <th>평가 대상</th>
                    <th>평가 기간</th>
                    <th>총점</th>
                    <th>등급</th>
                    <th>평가일</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {myEvaluations.map((evaluation) => (
                    <tr key={evaluation.evaluationId}>
                      <td>{evaluation.empName}</td>
                      <td>{evaluation.evaluationPeriod}</td>
                      <td>{evaluation.totalScore}점</td>
                      <td>
                        <span className={`grade-badge grade-${evaluation.grade}`}>
                          {evaluation.grade}
                        </span>
                      </td>
                      <td>{formatDate(evaluation.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-button"
                            onClick={() => handleEdit(evaluation.evaluationId)}
                          >
                            수정
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDelete(evaluation.evaluationId)}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Input;