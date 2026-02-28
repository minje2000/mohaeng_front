import { useState } from 'react';
import { withdrawal } from '../api/UserApi';
import { logout } from '../../auth/api/authApi';

export const useUserWithdrawal = () => {
  const [agreed, setAgreed] = useState(false);
  const [reasonIndex, setReasonIndex] = useState(null);
  const [extraReason, setExtraReason] = useState('');

  const reasons = [
    '다른 이메일로 서비스를 이용하기 위해',
    '고객 응대 서비스가 좋지 않아서',
    '더 이상 서비스를 이용할 일이 없어서',
    '기타',
  ];

  const handleWithdrawal = async () => {
    if (!agreed || reasonIndex === null) return;

    if (window.confirm('정말로 탈퇴하시겠습니까?')) {
      try {
        const finalExtraReason = extraReason.trim() === '' ? null : extraReason;
        const res = await withdrawal(reasonIndex + 1, finalExtraReason);
        
        alert(res.data);
        
        if (res.success === true) {
          // 토큰 처리를 위해 로그아웃 api 호출 및 홈 이동
          await logout();
          window.location.href = '/';
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || '회원 탈퇴 처리 중 오류가 발생했습니다.';
        alert(errorMessage);
        console.error('탈퇴 실패 :', error);
      }
    }
  };

  return {
    agreed,
    setAgreed,
    reasonIndex,
    setReasonIndex,
    extraReason,
    setExtraReason,
    reasons,
    handleWithdrawal,
    isSubmittable: agreed && reasonIndex !== null
  };
};