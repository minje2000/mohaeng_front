// src/features/admin/dormantmanage/hooks/useDormantManage.js
import { useCallback, useEffect, useState } from 'react';
import { dormantManageApi } from '../api/DormantManageApi';

const DEFAULT_PAGE_SIZE = 10;

export function useDormantManage() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [hasUnnotified, setHasUnnotified] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState(null);

  const loadPage = useCallback(
    async (pageIndex = 0, pageSize = size) => {
      setLoading(true);
      setError(null);
      try {
        const pageData = await dormantManageApi.getDormantUsers(pageIndex, pageSize);
        
        // console.log('content :', pageData?.content); 
        
        const content = pageData.content ?? [];
        setUsers(content);
        setPage(pageData.number ?? pageIndex);
        setSize(pageData.size ?? pageSize);
        setTotalPages(pageData.totalPages ?? 0);
        setTotalElements(pageData.totalElements ?? 0);

        // 안내 메일 발송 대상 유무
        const unnotifiedExists = content.some(user => !user.notifiedAt);
        // console.log('notifiedAt 없는 사용자 수:', unnotifiedExists ? content.filter(user => !user.notifiedAt).length : 0); 
        setHasUnnotified(unnotifiedExists);
        
      } catch (e) {
        console.error('loadPage 에러:', e);
        setError(e?.message || '휴면 계정 목록 조회 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    },
    [size],
  );

  useEffect(() => {
    loadPage(0, size);
  }, [loadPage, size]);

  const handleChangePage = async (nextPage) => {
    if (nextPage < 0 || (totalPages && nextPage >= totalPages)) return;
    await loadPage(nextPage, size);
  };

  const handleSendEmail = async () => {
    if (!hasUnnotified) {
      alert('안내 메일 발송할 계정이 없습니다.');
      return;
    }
    
    if (!window.confirm('안내 메일을 발송하시겠습니까?')) return;
    setEmailSending(true);
    setError(null);
    try {
      await dormantManageApi.sendDormantUserEmail();
      alert('안내 메일이 전송되었습니다.\n7일 이내 로그인하지 않은 회원은 자동 탈퇴 처리 됩니다.');
      await loadPage(page, size);
    } catch (e) {
      console.error(e);
      setError(e?.message || '메일 발송 중 오류가 발생했습니다.');
    } finally {
      setEmailSending(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!window.confirm('메일 발송한 휴면 계정을 탈퇴 처리하시겠습니까?')) return;
    setWithdrawing(true);
    setError(null);
    try {
      await dormantManageApi.handleDormantWithdrawal();
      alert('탈퇴 처리를 완료했습니다.');
      const nextPage =
        page > 0 && page === totalPages - 1 && users.length === 0 ? page - 1 : page;
      await loadPage(nextPage, size);
    } catch (e) {
      console.error(e);
      setError(e?.message || '탈퇴 처리 중 오류가 발생했습니다.');
    } finally {
      setWithdrawing(false);
    }
  };

  return {
    users,
    page,
    size,
    totalPages,
    totalElements,
    loading,
    emailSending,
    withdrawing,
    hasUnnotified, 
    error,
    loadPage,
    handleChangePage,
    handleSendEmail,
    handleWithdrawal,
  };
}
