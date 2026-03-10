import { useCallback, useEffect, useState } from 'react';
import { ParticipationBoothApi } from '../api/ParticipationBoothAPI';

export default function UseBoothManage() {
  const [received, setReceived] = useState([]);
  const [applied, setApplied] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [recvRes, applRes] = await Promise.all([
        ParticipationBoothApi.getMyReceivedBoothList(),
        ParticipationBoothApi.getMyAppliedBoothList(),
      ]);

      // 💡 1. 백엔드 응답이 배열이 아닐 경우를 대비해 안전하게 데이터를 꺼냅니다.
      const rawRecv = Array.isArray(recvRes) ? recvRes : (recvRes?.data || recvRes?.content || []);
      const rawAppl = Array.isArray(applRes) ? applRes : (applRes?.data || applRes?.content || []);

      // (디버깅용) 콘솔에서 실제 어떤 값이 들어오는지 확인합니다.
      console.log("백엔드에서 가져온 받은 부스(원본):", rawRecv);
      console.log("백엔드에서 가져온 신청 부스(원본):", rawAppl);

      // 💡 2. 양옆 공백(trim)을 모두 제거하고 완벽하게 '취소'인 것만 걸러냅니다.
      const filteredRecv = rawRecv.filter((item) => {
        const s = String(item.status || '').trim();
        return s !== '취소' && s !== 'CANCEL';
      });

      const filteredAppl = rawAppl.filter((item) => {
        const s = String(item.status || '').trim();
        return s !== '취소' && s !== 'CANCEL';
      });

      setReceived(filteredRecv);
      setApplied(filteredAppl);
    } catch (error) {
      console.error("데이터를 불러오는 중 에러 발생:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    received,
    applied,
    loading,
    refresh: load,
  };
}