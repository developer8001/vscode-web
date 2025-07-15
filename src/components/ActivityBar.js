import React from 'react';

// 아이콘은 텍스트로 임시 대체. 실제로는 react-icons 같은 라이브러리 사용 추천
const ActivityBar = ({ onActivityChange, activeActivity }) => {
  return (
    <div className="activity-bar">
      <button 
        className={`activity-bar-button ${activeActivity === 'explorer' ? 'active' : ''}`}
        onClick={() => onActivityChange('explorer')}
        title="Explorer">
        📄
      </button>
      {/* 다른 액티비티 버튼 추가 가능 */}
    </div>
  );
};

export default ActivityBar;
