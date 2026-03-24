import React from 'react';
import { useDormantManage } from '../hooks/useDormantManage';
import styles from '../styles/DormantManage.module.css';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return String(dateStr).slice(0, 10);
}

function buildPageItems(totalPages, current) {
  const last = totalPages - 1;
  if (totalPages <= 1) return [0];

  const windowSize = 2;
  const set = new Set([0, last]);

  for (let p = current - windowSize; p <= current + windowSize; p += 1) {
    if (p >= 0 && p <= last) set.add(p);
  }

  const pages = Array.from(set).sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < pages.length; i += 1) {
    const p = pages[i];
    const prev = pages[i - 1];
    if (i > 0 && p - prev > 1) result.push('...');
    result.push(p);
  }

  return result;
}

export default function DormantManage() {
  const {
    users,
    page,
    size,
    totalPages,
    totalElements,
    loading,
    emailSending,
    withdrawing,
    error,
    handleChangePage,
    handleSendEmail,
    hasUnnotified,
    handleWithdrawal,
  } = useDormantManage();

  const pagerItems = buildPageItems(totalPages, page);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.title}>휴면 계정 관리</h2>
          <div className={styles.totalTop}>총 {totalElements ?? 0}건</div>
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={`${styles.actionButton} ${!hasUnnotified ? styles.disabledButton : ''}`}
            onClick={handleSendEmail}
            disabled={loading || emailSending || !hasUnnotified}
            title={!hasUnnotified ? '안내 메일 발송할 계정이 없습니다.' : ''}
          >
            메일 발송
          </button>

          {/* <button
            type="button"
            className={styles.actionButton}
            onClick={handleWithdrawal}
            disabled={loading || withdrawing}
          >
            탈퇴 처리
          </button> */}
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>번호</th>
              <th>이메일</th>
              <th>마지막 로그인 날짜</th>
              <th>안내 메일 발송일</th>
              <th>자동 탈퇴 예정일</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className={styles.centerText}>
                  로딩 중...
                </td>
              </tr>
            )}

            {emailSending && !loading && (
              <tr>
                <td colSpan={4} className={styles.centerText}>
                  안내 메일 발송 중...
                </td>
              </tr>
            )}

            {!loading && !emailSending && users.length === 0 && (
              <tr>
                <td colSpan={4} className={styles.centerText}>
                  휴면 계정이 없습니다.
                </td>
              </tr>
            )}

            {!loading &&
              !emailSending &&
              users.map((user, index) => (
                <tr key={user.dormantId ?? `${user.email}-${index}`}>
                  <td>{page * size + index + 1}</td>
                  <td>{user.email}</td>
                  <td>{formatDate(user.lastLoginAt)}</td>
                  <td>{formatDate(user.notifiedAt)}</td>
                  <td>{formatDate(user.withdrawnAt)}</td>
                </tr>
              ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className={styles.paginationWrap}>
            <button
              type="button"
              className={styles.pageButton}
              onClick={() => handleChangePage(page - 1)}
              disabled={page === 0}
            >
              이전
            </button>

            {pagerItems.map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className={styles.dots}>
                  …
                </span>
              ) : (
                <button
                  type="button"
                  key={p}
                  className={`${styles.pageButton} ${p === page ? styles.activePage : ''}`}
                  onClick={() => handleChangePage(p)}
                >
                  {p + 1}
                </button>
              )
            )}

            <button
              type="button"
              className={styles.pageButton}
              onClick={() => handleChangePage(page + 1)}
              disabled={totalPages === 0 || page >= totalPages - 1}
            >
              다음
            </button>
          </div>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}