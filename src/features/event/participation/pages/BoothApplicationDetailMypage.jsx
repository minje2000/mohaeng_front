import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import eventThumbUrl from '../../../../shared/utils/eventThumbUrl';
import { ParticipationBoothApi } from '../api/ParticipationBoothAPI';

function Field({ label, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 900, color: '#6B7280' }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>
        {children}
      </div>
    </div>
  );
}

export default function BoothApplicationDetailMypage() {
  const { pctBoothId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await ParticipationBoothApi.getBoothApplicationDetail(pctBoothId);
        if (!mounted) return;
        setData(res);
      } catch (e) {
        if (!mounted) return;
        setError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [pctBoothId]);

  const files = useMemo(() => {
    const list = data?.files;
    return Array.isArray(list) ? list : [];
  }, [data]);

  const goEvent = () => {
    if (!data?.eventId) return;
    navigate(`/events/${data.eventId}`);
  };

  if (loading) {
    return (
      <div style={{ padding: 20, color: '#6B7280', fontWeight: 800 }}>
        불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, color: '#991B1B', fontWeight: 900 }}>
        신청서를 불러오지 못했어요.
      </div>
    );
  }

  if (!data) return null;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F9FAFB',
        fontFamily:
          "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 18px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid #E5E7EB',
              background: '#fff',
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            뒤로
          </button>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: '#111827',
            }}
          >
            부스 신청서
          </div>
        </div>

        {/* Event card */}
        <button
          type="button"
          onClick={goEvent}
          style={{
            width: '100%',
            marginTop: 16,
            border: '1px solid #E5E7EB',
            borderRadius: 16,
            background: '#fff',
            padding: 16,
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <img
            src={eventThumbUrl(data.eventThumbnail)}
            alt="thumb"
            style={{
              width: 88,
              height: 66,
              objectFit: 'cover',
              borderRadius: 14,
              border: '1px solid #E5E7EB',
              background: '#F3F4F6',
              flex: '0 0 auto',
            }}
            onError={(e) => {
              e.currentTarget.src = '/images/moheng.png';
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: '#111827',
                letterSpacing: '-0.02em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {data.eventTitle || `행사 #${data.eventId}`}
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: '#6B7280' }}>
              행사 상세로 이동
            </div>
          </div>
        </button>

        {/* Detail */}
        <div
          style={{
            marginTop: 14,
            border: '1px solid #E5E7EB',
            borderRadius: 16,
            background: '#fff',
            padding: 18,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: '#111827',
              letterSpacing: '-0.02em',
              marginBottom: 14,
            }}
          >
            신청 정보
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="부스 제목">{data.boothTitle || '-'}</Field>
            <Field label="부스 주제">{data.boothTopic || '-'}</Field>
            <Field label="홈페이지">{data.homepageUrl || '-'}</Field>
            <Field label="주요 품목">{data.mainItems || '-'}</Field>
            <Field label="수량">{data.boothCount ?? '-'}</Field>
            <Field label="금액">
              {Number(data.totalPrice ?? 0).toLocaleString()}원
            </Field>
            <Field label="상태">{data.status || '-'}</Field>
            <Field label="설명">
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
                {data.description || '-'}
              </div>
            </Field>

            <Field label="첨부파일">
              {files.length === 0 ? (
                <span style={{ color: '#6B7280' }}>없음</span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {files.map((f) => (
                    <a
                      key={f.renameFileName}
                      href={`http://localhost:8080/upload_files/pbooth/${f.renameFileName}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: '#111827',
                        fontWeight: 900,
                        textDecoration: 'underline',
                      }}
                    >
                      {f.originalFileName || f.renameFileName}
                    </a>
                  ))}
                </div>
              )}
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}
