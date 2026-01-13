import { useState, useEffect } from 'react';
import { resultApi } from '../api/resultApi';
import '../styles/View.css';

const View = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const data = await resultApi.getMyEvaluations();
      setEvaluations(data);
      if (data.length > 0) {
        setSelectedEvaluation(data[0]);
      }
    } catch (error) {
      console.error('평가 결과 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'S': return '#FFD700'; // Gold
      case 'A': return '#4A90E2'; // Blue
      case 'B': return '#7ED321'; // Green
      case 'C': return '#9B9B9B'; // Gray
      default: return '#9B9B9B';
    }
  };

  const getGradeLabel = (grade) => {
    switch (grade) {
      case 'S': return '탁월';
      case 'A': return '우수';
      case 'B': return '보통';
      case 'C': return '개선필요';
      default: return '-';
    }
  };

  if (loading) {
    return <div className="eval-view-container">로딩 중...</div>;
  }

  if (!selectedEvaluation) {
    return <div className="eval-view-container">평가 결과가 없습니다.</div>;
  }

  return (
    <div className="eval-view-container">
      {/* 헤더 */}
      <div className="eval-header">
        <h1>평가 결과 조회</h1>
        <div className="eval-period">{selectedEvaluation.evaluationPeriod}</div>
      </div>

      {/* 평가 목록 선택 */}
      {evaluations.length > 1 && (
        <div className="eval-list-selector">
          {evaluations.map((evaluation) => (
            <button
              key={evaluation.evaluationId}
              className={`eval-list-item ${selectedEvaluation.evaluationId === evaluation.evaluationId ? 'active' : ''}`}
              onClick={() => setSelectedEvaluation(evaluation)}
            >
              <div className="eval-list-period">{evaluation.evaluationPeriod}</div>
              <div className="eval-list-score">{evaluation.totalScore}점</div>
            </button>
          ))}
        </div>
      )}

      {/* 평가 결과 카드 */}
      <div className="eval-content">
        {/* 점수 및 등급 카드 */}
        <div className="eval-card score-card">
          <div className="score-main">
            <div className="score-number">{selectedEvaluation.totalScore}</div>
            <div className="score-label">점</div>
          </div>
          <div
            className="grade-badge"
            style={{ backgroundColor: getGradeColor(selectedEvaluation.grade) }}
          >
            {selectedEvaluation.grade} 등급
          </div>
          <div className="grade-description">{getGradeLabel(selectedEvaluation.grade)}</div>
        </div>

        {/* 평가 정보 카드 */}
        <div className="eval-card info-card">
          <div className="info-row">
            <span className="info-label">평가 대상</span>
            <span className="info-value">{selectedEvaluation.empName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">평가자</span>
            <span className="info-value">{selectedEvaluation.evaluatorName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">평가일</span>
            <span className="info-value">
              {new Date(selectedEvaluation.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>

        {/* 평가 항목별 점수 카드 */}
        <div className="eval-card criteria-card">
          <h3 className="card-title">평가 항목별 점수</h3>
          <div className="criteria-list">
            {selectedEvaluation.scores && selectedEvaluation.scores.map((score) => (
              <div key={score.detailId} className="criteria-item">
                <div className="criteria-header">
                  <span className="criteria-name">{score.criteriaName}</span>
                  <span className="criteria-score">{score.score}점</span>
                </div>
                <div className="criteria-bar-container">
                  <div
                    className="criteria-bar"
                    style={{ width: `${score.score}%` }}
                  />
                </div>
                <div className="criteria-weight">가중치: {score.weight}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* 평가 의견 카드 */}
        {selectedEvaluation.comment && (
          <div className="eval-card comment-card">
            <h3 className="card-title">평가 의견</h3>
            <div className="comment-content">{selectedEvaluation.comment}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default View;