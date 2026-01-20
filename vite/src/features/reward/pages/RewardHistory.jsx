import { useState, useEffect } from 'react';
import { candidateApi } from '../api/candidateApi';
import { policyApi } from '../api/policyApi';
import '../styles/RewardHistory.css';

const RewardHistory = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rewardHistory, setRewardHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [policyMap, setPolicyMap] = useState({});
  const [selectedReward, setSelectedReward] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 필터 상태
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    rewardType: '',
    searchTerm: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, rewardHistory]);

  const loadData = async () => {
    try {
      setLoading(true);

      const user = await candidateApi.getCurrentUser();
      setCurrentUser(user);

      const policies = await policyApi.getAllPolicies();
      const policyMapData = {};
      policies.forEach(policy => {
        policyMapData[policy.policyId] = policy;
      });
      setPolicyMap(policyMapData);

      const rewards = await candidateApi.getMyApprovedRewards();
      setRewardHistory(Array.isArray(rewards) ? rewards : []);
      setFilteredHistory(Array.isArray(rewards) ? rewards : []);
    } catch (error) {
      console.error('[포상 이력] 데이터 로딩 실패:', error);
      setRewardHistory([]);
      setFilteredHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...rewardHistory];

    // 날짜 필터
    if (filters.startDate) {
      filtered = filtered.filter(reward => {
        const rewardDate = new Date(reward.updatedAt || reward.createdAt);
        return rewardDate >= new Date(filters.startDate);
      });
    }
    if (filters.endDate) {
      filtered = filtered.filter(reward => {
        const rewardDate = new Date(reward.updatedAt || reward.createdAt);
        return rewardDate <= new Date(filters.endDate + 'T23:59:59');
      });
    }

    // 포상 종류 필터
    if (filters.rewardType) {
      filtered = filtered.filter(reward => {
        const policy = policyMap[reward.policyId];
        return policy && policy.rewardType === filters.rewardType;
      });
    }

    // 검색어 필터
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(reward => {
        const policy = policyMap[reward.policyId];
        return (
          reward.policyName?.toLowerCase().includes(term) ||
          reward.reason?.toLowerCase().includes(term) ||
          policy?.rewardType?.toLowerCase().includes(term)
        );
      });
    }

    setFilteredHistory(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      rewardType: '',
      searchTerm: ''
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatAmount = (reward) => {
    const policy = policyMap[reward.policyId];
    if (!policy || !reward.rewardAmount) return '-';
    const unit = policy.rewardType === '휴가' ? '일' : '원';
    return reward.rewardAmount.toLocaleString() + unit;
  };

  const getTotalRewardAmount = () => {
    let totalCount = filteredHistory.length;
    let totalCash = 0;
    let totalVacation = 0;

    filteredHistory.forEach(reward => {
      const policy = policyMap[reward.policyId];
      if (policy && reward.rewardAmount) {
        if (policy.rewardType === '휴가') {
          totalVacation += reward.rewardAmount;
        } else {
          totalCash += reward.rewardAmount;
        }
      }
    });

    return { totalCount, totalCash, totalVacation };
  };

  const getRewardTypes = () => {
    const types = new Set();
    rewardHistory.forEach(reward => {
      const policy = policyMap[reward.policyId];
      if (policy && policy.rewardType) {
        types.add(policy.rewardType);
      }
    });
    return Array.from(types);
  };

  const handleRowClick = (reward) => {
    setSelectedReward(reward);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReward(null);
  };

  if (loading) {
    return <div className="reward-history-container">로딩 중...</div>;
  }

  const { totalCount, totalCash, totalVacation } = getTotalRewardAmount();

  return (
    <div className="reward-history-container">
      <div className="reward-history-header">
        <h1 className="reward-history-title">내 포상 이력</h1>
      </div>

      {/* 누적 포상 요약 카드 */}
      <div className="summary-card-section">
        <div className="summary-card-header">
          <span className="trophy-icon">🏆</span>
          <h2>누적 포상 요약</h2>
        </div>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">총 포상 횟수</span>
            <span className="stat-value gold">{totalCount}회</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-label">총 포상 금액</span>
            <span className="stat-value gold">{totalCash.toLocaleString()}원</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-label">받은 휴가</span>
            <span className="stat-value gold">{totalVacation}일</span>
          </div>
        </div>
      </div>

      {/* 필터 영역 */}
      <div className="filter-section">
        <div className="filter-group">
          <label>기간 선택</label>
          <div className="date-range">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="filter-input"
            />
            <span className="date-separator">~</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="filter-input"
            />
          </div>
        </div>

        <div className="filter-group">
          <label>포상 종류</label>
          <select
            value={filters.rewardType}
            onChange={(e) => handleFilterChange('rewardType', e.target.value)}
            className="filter-select"
          >
            <option value="">전체</option>
            {getRewardTypes().map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>검색</label>
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            placeholder="포상명, 사유 검색"
            className="filter-input search-input"
          />
        </div>

        <button onClick={resetFilters} className="reset-button">초기화</button>
      </div>

      {/* 포상 내역 테이블 */}
      <div className="history-table-section">
        {filteredHistory.length === 0 ? (
          <div className="empty-history">
            <div className="empty-icon">🏆</div>
            <p className="empty-message">포상 이력이 없습니다.</p>
            <p className="empty-sub-message">
              {rewardHistory.length === 0
                ? '추천을 받으면 포상을 받을 수 있습니다.'
                : '검색 조건을 변경해보세요.'}
            </p>
          </div>
        ) : (
          <table className="reward-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>포상명</th>
                <th>포상 종류</th>
                <th>지급 내용</th>
                <th>사유</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((reward) => (
                <tr key={reward.candidateId} onClick={() => handleRowClick(reward)} className="clickable-row">
                  <td>{formatDate(reward.updatedAt || reward.createdAt)}</td>
                  <td className="policy-name">{reward.policyName}</td>
                  <td>{policyMap[reward.policyId]?.rewardType || '-'}</td>
                  <td className="amount-text">{formatAmount(reward)}</td>
                  <td className="reason-text" title={reward.reason}>
                    {reward.reason}
                  </td>
                  <td>
                    <span className="status-badge completed">지급완료</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 상세 모달 */}
      {isModalOpen && selectedReward && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <span className="modal-trophy">🏆</span>
                {selectedReward.policyName}
              </h2>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <span className="modal-label">포상 종류</span>
                <span className="modal-value">{policyMap[selectedReward.policyId]?.rewardType || '-'}</span>
              </div>
              <div className="modal-field">
                <span className="modal-label">지급 내용</span>
                <span className="modal-value">{formatAmount(selectedReward)}</span>
              </div>
              <div className="modal-field">
                <span className="modal-label">지급일</span>
                <span className="modal-value">{formatDate(selectedReward.updatedAt || selectedReward.createdAt)}</span>
              </div>
              <div className="modal-field">
                <span className="modal-label">추천자</span>
                <span className="modal-value">{selectedReward.nominatorName}</span>
              </div>
              <div className="modal-field full-width">
                <span className="modal-label">사유</span>
                <div className="modal-reason">
                  "{selectedReward.reason}"
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeModal} className="modal-close-button">확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardHistory;