import React, { useEffect, useState } from 'react';
import {
  fetchEventReviews,
  fetchMyReviewForEvent,
  createReview,
  updateReview,
  deleteReview,
} from '../api/reviewApi';
import { tokenStore } from '../../../../app/http/tokenStore';

function StarRating({ value, onChange, readonly }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          onClick={() => { if (!readonly) onChange(s); }}
          onMouseEnter={() => { if (!readonly) setHover(s); }}
          onMouseLeave={() => { if (!readonly) setHover(0); }}
          style={{
            fontSize: 22,
            cursor: readonly ? 'default' : 'pointer',
            color: s <= (hover || value) ? '#FFD700' : '#E5E7EB',
            transition: 'color 0.1s',
            userSelect: 'none',
          }}
        >★</span>
      ))}
    </div>
  );
}

function checkLogin() {
  try { return Boolean(tokenStore.getAccess()); }
  catch { return false; }
}

function ReviewCard({ review }) {
  const dateStr = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('ko-KR')
    : '';
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #F3F4F6', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#111' }}>
            {review.userName || review.nickname || '익명'}
          </span>
          {dateStr && <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 10 }}>{dateStr}</span>}
        </div>
        <StarRating value={review.rating ?? 0} readonly />
      </div>
      <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
        {review.content}
      </p>
    </div>
  );
}

const btnStyle = (bg) => ({
  padding: '7px 16px', borderRadius: 10, border: 'none',
  cursor: 'pointer', background: bg, color: '#fff',
  fontSize: 13, fontWeight: 800,
});

export default function EventReviewTab({ eventId }) {
  const loggedIn = checkLogin();

  const [reviews,    setReviews]    = useState([]);
  const [myReview,   setMyReview]   = useState(null);
  const [page,       setPage]       = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [formOpen,   setFormOpen]   = useState(false);
  const [editMode,   setEditMode]   = useState(false);
  const [rating,     setRating]     = useState(5);
  const [content,    setContent]    = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    fetchEventReviews(eventId, { page, size: 10 })
      .then((res) => {
        if (!alive) return;
        setReviews(res.items || []);
        const tp = res.raw?.totalPages ?? res.raw?.page?.totalPages ?? 1;
        setTotalPages(Number(tp) || 1);
      })
      .catch((e) => { if (alive) setError(e.message || '리뷰를 불러오지 못했어요.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [eventId, page]);

  useEffect(() => {
    if (!loggedIn) return;
    fetchMyReviewForEvent(eventId)
      .then(setMyReview)
      .catch(() => setMyReview(null));
  }, [eventId, loggedIn]);

  const openWrite = () => { setEditMode(false); setRating(5); setContent(''); setFormOpen(true); };
  const openEdit  = () => {
    if (!myReview) return;
    setEditMode(true); setRating(myReview.rating ?? 5); setContent(myReview.content ?? ''); setFormOpen(true);
  };

  const reloadAll = () => {
    fetchEventReviews(eventId, { page, size: 10 }).then((res) => {
      setReviews(res.items || []);
      const tp = res.raw?.totalPages ?? 1;
      setTotalPages(Number(tp) || 1);
    });
    fetchMyReviewForEvent(eventId).then(setMyReview).catch(() => setMyReview(null));
  };

  const handleSubmit = () => {
    if (!content.trim()) { alert('내용을 입력해주세요.'); return; }
    setSubmitting(true);
    const call = editMode && myReview
      ? updateReview(myReview.reviewId, { eventId, rating, content })
      : createReview({ eventId, rating, content });
    call
      .then(() => { setFormOpen(false); reloadAll(); })
      .catch((e) => alert(e.message || '저장에 실패했어요.'))
      .finally(() => setSubmitting(false));
  };

  const handleDelete = () => {
    if (!myReview || !window.confirm('리뷰를 삭제할까요?')) return;
    deleteReview(myReview.reviewId)
      .then(() => { setMyReview(null); reloadAll(); })
      .catch((e) => alert(e.message || '삭제에 실패했어요.'));
  };

  return (
    <div style={{ padding: '24px' }}>
      {loggedIn && (
        <div style={{ background: '#FFFBEB', borderRadius: 14, padding: '16px 20px', marginBottom: 24, border: '1px solid #FDE68A' }}>
          {myReview ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#92400E' }}>내가 쓴 리뷰</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={openEdit}    style={btnStyle('#F97316')}>수정</button>
                  <button onClick={handleDelete} style={btnStyle('#EF4444')}>삭제</button>
                </div>
              </div>
              <StarRating value={myReview.rating ?? 0} readonly />
              <p style={{ margin: '8px 0 0', fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{myReview.content}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#92400E', fontWeight: 700 }}>이 행사에 참여하셨나요? 리뷰를 남겨보세요!</span>
              <button onClick={openWrite} style={btnStyle('#F97316')}>리뷰 작성</button>
            </div>
          )}
        </div>
      )}

      {formOpen && (
        <div style={{ background: '#fff', border: '2px solid #F97316', borderRadius: 14, padding: '20px', marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#111', marginBottom: 12 }}>
            {editMode ? '리뷰 수정' : '리뷰 작성'}
          </div>
          <div style={{ marginBottom: 12 }}>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="행사에 대한 솔직한 후기를 남겨주세요..."
            rows={4}
            style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 14, resize: 'vertical', outline: 'none', lineHeight: 1.6 }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
            <button onClick={() => setFormOpen(false)} style={btnStyle('#9CA3AF')}>취소</button>
            <button onClick={handleSubmit} disabled={submitting} style={btnStyle('#F97316')}>
              {submitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: 14 }}>리뷰를 불러오는 중...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#EF4444', fontSize: 14 }}>{error}</div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#D1D5DB' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>아직 리뷰가 없어요.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reviews.map((r) => <ReviewCard key={r.reviewId} review={r} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              style={{ width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 14, background: i === page ? '#FFD700' : '#F3F4F6', color: i === page ? '#111' : '#6B7280' }}
            >{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
