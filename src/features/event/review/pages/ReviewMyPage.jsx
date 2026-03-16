import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyReviews } from '../api/reviewApi';
import MyPageReviewList from '../components/MyPageReviewList';
import '../styles/review-ui.css';

function getPageNumbers(page, totalPages) {
  const current = page + 1;
  const safeTotal = Math.max(1, totalPages || 1);
  const start = Math.max(1, Math.min(current - 2, safeTotal - 4));
  const end = Math.min(safeTotal, start + 4);
  return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
}

export default function ReviewMyPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const size = 5;

  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetchMyReviews({ page, size });
        if (!alive) return;

        setItems(res.items);

        const raw = res.raw || {};
        const tp = raw.totalPages ?? raw.totalPage ?? raw.page?.totalPages ?? raw.pageInfo?.totalPages ?? 1;
        setTotalPages(Number(tp) || 1);
      } catch (e) {
        if (!alive) return;
        setError(e.message || '내 리뷰를 불러오지 못했어요.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [page]);

  const onClickItem = (item) => {
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
  navigate(`/events/${item.eventId}?tab=review`);
};

  const pageNumbers = useMemo(() => getPageNumbers(page, totalPages), [page, totalPages]);

  return (
    <div className="mh-wrap">
      <div className="mh-content">
        <div className="mh-title">리뷰 작성 내역</div>

        {loading && <div className="mh-stateCard">로딩중...</div>}
        {!loading && error && <div className="mh-stateCard mh-stateError">{error}</div>}

        {!loading && !error && (
          <>
            <MyPageReviewList items={items} onClickItem={onClickItem} />

            {totalPages > 1 && (
              <div className="mh-pagination">
                <button className="mh-pageTextBtn" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>이전</button>
                {pageNumbers.map((num) => (
                  <button key={num} className={`mh-pageBtn ${num === page + 1 ? 'active' : ''}`} onClick={() => setPage(num - 1)}>{num}</button>
                ))}
                <button className="mh-pageTextBtn" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>다음</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
