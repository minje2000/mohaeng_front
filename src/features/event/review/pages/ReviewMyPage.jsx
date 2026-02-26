import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyReviews } from '../api/reviewApi';
import MyPageReviewList from '../components/MyPageReviewList';
import '../styles/review-ui.css';

export default function ReviewMyPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const size = 10;

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
        const tp =
          raw.totalPages ??
          raw.totalPage ??
          raw.page?.totalPages ??
          raw.pageInfo?.totalPages ??
          1;

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
    //  행사 상세페이지로 이동하면서 리뷰 탭 자동 오픈
    navigate(`/events/${item.eventId}?tab=review`);
  };

  return (
    <div className="mh-wrap">
      <div className="mh-content">
        <div className="mh-title">리뷰 작성 내역</div>

        {loading && <div className="mh-muted">로딩중...</div>}
        {!loading && error && <div style={{ color: 'crimson' }}>{error}</div>}

        {!loading && !error && (
          <>
            <MyPageReviewList items={items} onClickItem={onClickItem} />

            {totalPages > 1 && (
              <div className="mh-pagination">
                <span>[</span>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <React.Fragment key={i}>
                    <button
                      className={`mh-pageBtn ${i === page ? 'active' : ''}`}
                      onClick={() => setPage(i)}
                    >
                      {i + 1}
                    </button>
                    {i !== totalPages - 1 && <span className="mh-dot">.</span>}
                  </React.Fragment>
                ))}
                <span>]</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}