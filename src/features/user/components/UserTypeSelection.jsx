import React from 'react';

const TypeSelection = ({ onSelect }) => {
  return (
    <div className="flex gap-6">
      <button 
        onClick={() => onSelect('individual')}
        className="flex flex-col items-center justify-center w-64 h-80 border-2 border-orange-200 rounded-2xl hover:bg-orange-50 transition-colors"
      >
        <div className="w-24 h-24 bg-orange-300 rounded-full mb-6"></div>
        <span className="text-xl font-bold">개인 회원</span>
      </button>

      <button 
        onClick={() => onSelect('business')}
        className="flex flex-col items-center justify-center w-64 h-80 border-2 border-orange-200 rounded-2xl hover:bg-orange-50 transition-colors"
      >
        <div className="w-24 h-24 border-4 border-orange-300 rounded-lg mb-6 flex items-center justify-center">
           {/* 빌딩 아이콘 모양 대신 간단한 사각형 처리 */}
           <div className="grid grid-cols-2 gap-1">
             {[...Array(4)].map((_,i) => <div key={i} className="w-4 h-4 bg-orange-300"></div>)}
           </div>
        </div>
        <span className="text-xl font-bold">업체 회원</span>
      </button>
    </div>
  );
};

export default TypeSelection;