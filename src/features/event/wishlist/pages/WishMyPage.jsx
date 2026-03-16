import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './WishMyPage.module.css';
import {
  fetchWishlist,
  removeWishlist,
  toggleWishlistNotification,
} from '../api/wishlistApi';

const UPLOAD_BASE = 'http://localhost:8080/upload_files/event';
const PLACEHOLDER = 'https://dummyimage.com/80x80/f3f4f6/666666.png&text=Mohaeng';

function toImgUrl(v) {
  if (!v || typeof v !== 'string') return null;
  if (v.startsWith('http')) return v;
  return `${UPLOAD_BASE}/${v}`;
}

function getTitle(item) {
  return item?.eventTitle || item?.title || item?.name || item?.event?.title || (item?.eventId != null ? `행사 #${item.eventId}` : '행사');
}

function getThumb(item) {
  return toImgUrl(
    item?.eventThumbnail ||
    item?.thumbnail ||
    item?.thumbnailUrl ||
    item?.thumbUrl ||
    item?.imageUrl ||
    item?.posterUrl ||
    item?.eventImageUrl ||
    item?.event?.thumbnail ||
    item?.event?.eventThumbnail ||
    null
  );
}

function getNotiEnabled(item) {
  return Boolean(item?.notificationEnabled ?? item?.notiEnabled ?? item?.alarmEnabled ?? item?.notifyEnabled ?? false);
}

function setNotiEnabledOnItem(item, enabled) {
  return { ...item, notificationEnabled: enabled };
}

function getSimpleExplain(item) {
  return (
    item?.simpleExplain ||
    item?.eventSimpleExplain ||
    item?.simple_explain ||
    item?.SIMPLE_EXPLAIN ||
    item?.event?.simpleExplain ||
    item?.event?.simple_explain ||
    item?.description ||
    item?.eventDescription ||
    ''
  );
}

function getPeriod(item) {
  const start =
    item?.eventStartDate ||
    item?.startDate ||
    item?.eventStart ||
    item?.START_DATE ||
    item?.EVENT_START_DATE ||
    item?.event?.startDate ||
    item?.event?.START_DATE;
  const end =
    item?.eventEndDate ||
    item?.endDate ||
    item?.eventEnd ||
    item?.END_DATE ||
    item?.EVENT_END_DATE ||
    item?.event?.endDate ||
    item?.event?.END_DATE;
  const fmt = (v) => (v ? String(v).slice(0, 10).replaceAll('-', '.') : '-');
  return `${fmt(start)} ~ ${fmt(end)}`;
}

function getPageNumbers(page, totalPages) {
  const current = page + 1;
  const safeTotal = Math.max(1, totalPages || 1);
  const start = Math.max(1, Math.min(current - 2, safeTotal - 4));
  const end = Math.min(safeTotal, start + 4);
  return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
}

export default function WishMyPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [items, setItems] = useState([]);
  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const totalPages = useMemo(() => raw?.totalPages ?? 1, [raw]);
  const canPrev = page > 0;
  const canNext = totalPages != null ? page < totalPages - 1 : (items?.length ?? 0) === size;
  const pageNumbers = useMemo(() => getPageNumbers(page, totalPages), [page, totalPages]);

  const load = async (nextPage = page) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchWishlist({ page: nextPage, size });
      setItems(res?.items ?? []);
      setRaw(res?.raw ?? null);
      setPage(nextPage);
    } catch (e) {
      setItems([]);
      setRaw(null);
      setError(e?.message || '관심행사 목록을 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRowClick = (item) => {
  if (!item?.eventId) return;
  const status = (item?.eventStatus ?? '').toString().toUpperCase().replace('_', '');
  if (status === 'REPORTDELETED') {
    alert('이 행사에 대한 신고가 접수되어 삭제 처리 되었습니다.');
    return;
  }
  if (status === 'DELETED') {
    alert('주최자에 의하여 행사가 삭제되었습니다.');
    return;
  }
  navigate(`/events/${item.eventId}`);
};

  const handleRemove = async (wishId) => {
    if (!wishId) return;
    const ok = window.confirm('관심행사를 삭제할까요?');
    if (!ok) return;

    setRemovingId(wishId);
    try {
      await removeWishlist(wishId);
      setItems((prev) => prev.filter((it) => it.wishId !== wishId));
    } catch (e) {
      alert(e?.message || '삭제에 실패했어요.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleToggleNotification = async (item, nextEnabled) => {
    const wishId = item?.wishId;
    if (!wishId) return;

    setItems((prev) => prev.map((it) => (it.wishId === wishId ? setNotiEnabledOnItem(it, nextEnabled) : it)));

    setTogglingId(wishId);
    try {
      const updated = await toggleWishlistNotification(wishId, nextEnabled);
      if (updated && typeof updated === 'object') {
        setItems((prev) => prev.map((it) => (it.wishId === wishId ? { ...it, ...updated } : it)));
      }
    } catch (e) {
      setItems((prev) => prev.map((it) => (it.wishId === wishId ? setNotiEnabledOnItem(it, !nextEnabled) : it)));
      alert(e?.message || '알림 설정 변경에 실패했어요.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className={styles.pageShell}>
      <div className={styles.wrap}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>관심 행사 목록</h2>
        </div>

        <div className={styles.headerBar}>
          <div className={styles.colEvent}>행사</div>
          <div className={styles.colPeriod}>행사 기간</div>
          <div className={styles.colLike}>관심</div>
          <div className={styles.colNoti}>알림</div>
        </div>

        <div className={styles.listWrap}>
          {loading && <div className={styles.state}>불러오는 중...</div>}
          {!loading && error && <div className={styles.stateErr}>{error}</div>}
          {!loading && !error && items.length === 0 && <div className={styles.state}>관심행사가 없어요.</div>}

          {!loading && !error && items.map((item, idx) => {
            const thumb = getThumb(item);
            const title = getTitle(item);
            const summary = getSimpleExplain(item);
            const period = getPeriod(item);
            const isDeleted = ['DELETED', 'REPORTDELETED'].includes(
  (item?.eventStatus ?? '').toString().toUpperCase().replace('_', '')
);
            const notiEnabled = getNotiEnabled(item);
            const isRemoving = removingId === item.wishId;
            const isToggling = togglingId === item.wishId;

            return (
              <div key={item.wishId ?? `${item.eventId}-${idx}`} className={styles.rowCard}>
                <button type="button" className={styles.colEventBtn} title={isDeleted ? '삭제된 행사입니다' : '행사 상세로 이동'} onClick={() => handleRowClick(item)}>
                  <div className={styles.thumb}>
                    {thumb ? (
                      <img src={thumb} alt="" style={{ opacity: isDeleted ? 0.4 : 1 }} onError={(e) => { e.currentTarget.src = PLACEHOLDER; }} />
                    ) : (
                      <div className={styles.thumbFallback} />
                    )}
                  </div>
                  <div className={styles.infoText}>
                    <div className={styles.eventTitle} style={{ color: isDeleted ? '#9ca3af' : undefined }}>{title}</div>
                    <div className={styles.eventSummary} title={summary || '행사 한 줄 설명이 없습니다.'}>{summary || '행사 한 줄 설명이 없습니다.'}</div>
                  </div>
                </button>

                <div className={styles.colPeriod}>{period}</div>

                <div className={styles.colLike}>
                  <button type="button" className={`${styles.actionBtn} ${styles.likeBtn}`} onClick={() => handleRemove(item.wishId)} disabled={isRemoving} title="관심 해제">
                    {isRemoving ? '...' : '♥'}
                  </button>
                </div>

                <div className={styles.colNoti}>
                  <button type="button" className={`${styles.actionBtn} ${notiEnabled ? styles.notiOn : styles.notiOff}`} onClick={() => handleToggleNotification(item, !notiEnabled)} disabled={isToggling} title={notiEnabled ? '알림 끄기' : '알림 켜기'}>
                    {isToggling ? '...' : '🔔'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 ? (
          <div className={styles.pager}>
            <button type="button" onClick={() => load(page - 1)} disabled={loading || !canPrev} className={styles.pageTextBtn}>이전</button>
            {pageNumbers.map((num) => (
              <button key={num} type="button" onClick={() => load(num - 1)} className={`${styles.pageBtn} ${page + 1 === num ? styles.pageActive : ''}`}>{num}</button>
            ))}
            <button type="button" onClick={() => load(page + 1)} disabled={loading || !canNext} className={styles.pageTextBtn}>다음</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
