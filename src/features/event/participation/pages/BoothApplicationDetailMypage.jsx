import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import eventThumbUrl from '../../../../shared/utils/eventThumbUrl';
import {
  participantBoothFileUrl,
  photoImageUrl,
} from '../../../../shared/utils/uploadFileUrl';
import { ParticipationBoothApi } from '../api/ParticipationBoothAPI';

const S3_BASE = 'https://mohaeng-files.s3.ap-northeast-2.amazonaws.com';
const PBOOTH_BASE = `${S3_BASE}/participant-booth`;
const fmt = (n) => (n == null ? '-' : Number(n).toLocaleString());
const isImg = (f) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f || '');
const fmtDate = (d) => (d ? String(d).slice(0, 10).replaceAll('-', '.') : '-');

// ── 섹션 컨테이너 ──
function Section({ title, children }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
      }}
    >
      <div
        style={{
          padding: '12px 18px',
          borderBottom: '1px solid #E5E7EB',
          fontSize: 14,
          fontWeight: 900,
          color: '#111827',
          background: '#F9FAFB',
        }}
      >
        {title}
      </div>
      <div style={{ padding: '18px' }}>{children}</div>
    </div>
  );
}

// ── 필드 행 ──
function Field({ label, children }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '130px 1fr',
        gap: 12,
        padding: '8px 0',
        borderBottom: '1px solid #F3F4F6',
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#6B7280',
          paddingTop: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: '#111827',
          wordBreak: 'break-all',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── 상태 뱃지 ──
function StatusBadge({ status }) {
  const map = {
    PENDING: {
      bg: '#FFF7ED',
      color: '#C2410C',
      border: '#FED7AA',
      label: '검토 중',
    },
    APPROVED: {
      bg: '#ECFDF5',
      color: '#047857',
      border: '#A7F3D0',
      label: '승인',
    },
    REJECTED: {
      bg: '#FEF2F2',
      color: '#B91C1C',
      border: '#FCA5A5',
      label: '반려',
    },
    CANCELED: {
      bg: '#F3F4F6',
      color: '#6B7280',
      border: '#E5E7EB',
      label: '취소',
    },
    승인: { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0', label: '승인' },
    반려: { bg: '#FEF2F2', color: '#B91C1C', border: '#FCA5A5', label: '반려' },
    취소: { bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB', label: '취소' },
    신청: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', label: '신청' },
    결제완료: {
      bg: '#F0FDF4',
      color: '#15803D',
      border: '#BBF7D0',
      label: '결제완료',
    },
  };
  const s = map[status] || {
    bg: '#F3F4F6',
    color: '#374151',
    border: '#E5E7EB',
    label: status || '-',
  };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 800,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {s.label}
    </span>
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
        const res =
          await ParticipationBoothApi.getBoothApplicationDetail(pctBoothId);
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

  const facilities = useMemo(() => {
    const list = data?.facilities;
    return Array.isArray(list) ? list : [];
  }, [data]);

  const goEvent = () => {
    if (!data?.eventId) return;
    navigate(`/events/${data.eventId}`);
  };

  if (loading)
    return (
      <div style={{ padding: 20, color: '#6B7280', fontWeight: 800 }}>
        불러오는 중...
      </div>
    );
  if (error)
    return (
      <div style={{ padding: 20, color: '#991B1B', fontWeight: 900 }}>
        신청서를 불러오지 못했어요.
      </div>
    );
  if (!data) return null;

  const boothPrice = Number(data.boothPrice ?? 0);
  const facilityPrice = Number(data.facilityPrice ?? 0);
  const totalPrice = Number(data.totalPrice ?? 0);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F9FAFB',
        fontFamily:
          "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px 60px' }}
      >
        {/* 헤더 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 20,
          }}
        >
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

        {/* 행사 카드 */}
        <button
          type="button"
          onClick={goEvent}
          style={{
            width: '100%',
            marginBottom: 16,
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
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {data.eventTitle || `행사 #${data.eventId}`}
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: '#6B7280' }}>
              {fmtDate(data.startDate)} ~ {fmtDate(data.endDate)}
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: '#6B7280' }}>
              행사 상세로 이동 →
            </div>
          </div>
        </button>

        {/* ── 1행: 신청자 정보 | 신청 상태 ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            marginBottom: 16,
          }}
        >
          <Section title="👤 신청자 정보">
            {data.applicantProfileImg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  marginBottom: 14,
                  padding: '10px 14px',
                  background: '#F9FAFB',
                  borderRadius: 12,
                  border: '1px solid #E5E7EB',
                }}
              >
                <img
                  src={photoImageUrl(data.applicantProfileImg)}
                  alt="프로필"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #E5E7EB',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <Field label="이름">{data.applicantName || '-'}</Field>
            <Field label="이메일">{data.applicantEmail || '-'}</Field>
            <Field label="전화번호">{data.applicantPhone || '-'}</Field>
            <Field label="사업자번호">{data.applicantBusinessNum || '-'}</Field>
            <Field label="홈페이지 / SNS">
              {data.homepageUrl ? (
                <a
                  href={data.homepageUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: '#1D4ED8',
                    textDecoration: 'underline',
                    fontWeight: 700,
                  }}
                >
                  {data.homepageUrl}
                </a>
              ) : (
                '-'
              )}
            </Field>
          </Section>

          <Section title="📌 신청 상태">
            <Field label="상태">
              <StatusBadge status={data.status} />
            </Field>
            <Field label="신청일">{fmtDate(data.createdAt)}</Field>
            <Field label="승인일">
              {data.approvedDate ? fmtDate(data.approvedDate) : '-'}
            </Field>
          </Section>
        </div>

        {/* ── 2행: 선택 부스 | 선택 부대시설 ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            marginBottom: 16,
          }}
        >
          <Section title="🏗️ 선택 부스">
            <Field label="부스명">{data.boothName || '-'}</Field>
            <Field label="규격">{data.boothSize || '-'}</Field>
            {data.boothNote && <Field label="메모">{data.boothNote}</Field>}
            <Field label="단가">
              <span style={{ color: '#D97706', fontWeight: 900 }}>
                {fmt(data.boothUnitPrice)}원
              </span>
            </Field>
            <Field label="총 수량 / 잔여">
              {data.boothTotal ?? '-'} / {data.boothRemain ?? '-'}
            </Field>
          </Section>

          <Section title="🔧 선택 부대시설">
            {facilities.length === 0 ? (
              <span style={{ fontSize: 13, color: '#9CA3AF' }}>
                선택한 부대시설 없음
              </span>
            ) : (
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: '#F9FAFB',
                      borderBottom: '2px solid #E5E7EB',
                    }}
                  >
                    {['시설명', '단위', '수량', '단가', '금액'].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '8px 10px',
                          textAlign: 'left',
                          fontWeight: 800,
                          color: '#374151',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {facilities.map((f, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '10px 10px', fontWeight: 700 }}>
                        {f.faciName || '-'}
                      </td>
                      <td style={{ padding: '10px 10px', color: '#6B7280' }}>
                        {f.faciUnit || '-'}
                      </td>
                      <td style={{ padding: '10px 10px' }}>
                        {f.faciCount ?? '-'}
                      </td>
                      <td style={{ padding: '10px 10px', color: '#6B7280' }}>
                        {fmt(f.unitPrice)}원
                      </td>
                      <td
                        style={{
                          padding: '10px 10px',
                          fontWeight: 800,
                          color: '#D97706',
                        }}
                      >
                        {fmt(f.faciPrice)}원
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>
        </div>

        {/* ── 3행: 결제 금액 (전체 너비) ── */}
        <Section title="💳 결제 금액">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 16,
            }}
          >
            <div
              style={{
                background: '#F9FAFB',
                borderRadius: 12,
                padding: '16px 20px',
                border: '1px solid #E5E7EB',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: '#6B7280',
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                부스 비용
              </div>
              <div style={{ fontSize: 18, fontWeight: 900 }}>
                {fmt(boothPrice)}원
              </div>
            </div>
            <div
              style={{
                background: '#F9FAFB',
                borderRadius: 12,
                padding: '16px 20px',
                border: '1px solid #E5E7EB',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: '#6B7280',
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                부대시설 비용
              </div>
              <div style={{ fontSize: 18, fontWeight: 900 }}>
                {fmt(facilityPrice)}원
              </div>
            </div>
            <div
              style={{
                background: '#111827',
                borderRadius: 12,
                padding: '16px 20px',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: '#9CA3AF',
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                총 결제 금액
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>
                {fmt(totalPrice)}원
              </div>
            </div>
          </div>
        </Section>

        {/* ── 4행: 부스 운영 계획 (전체 너비) ── */}
        <Section title="📝 부스 운영 계획">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: 16,
              marginBottom: 16,
            }}
          >
            <Field label="부스 명칭">{data.boothTitle || '-'}</Field>
            <Field label="부스 주제">{data.boothTopic || '-'}</Field>
            <Field label="주요 품목">{data.mainItems || '-'}</Field>
            <Field label="신청 수량">{data.boothCount ?? '-'}</Field>
          </div>
          <Field label="상세 설명">
            {data.description ? (
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {data.description}
              </div>
            ) : (
              <span style={{ color: '#9CA3AF', fontWeight: 500 }}>
                상세설명 없음
              </span>
            )}
          </Field>
        </Section>

        {/* ── 5행: 첨부파일 (전체 너비) ── */}
        <Section title="📎 첨부파일">
          {files.length === 0 ? (
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>
              첨부파일 없음
            </span>
          ) : (
            <>
              {files.filter((f) => isImg(f.renameFileName)).length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  {files
                    .filter((f) => isImg(f.renameFileName))
                    .map((f) => (
                      <a
                        key={f.renameFileName}
                        href={`${PBOOTH_BASE}/${f.renameFileName}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          src={`${PBOOTH_BASE}/${f.renameFileName}`}
                          alt={f.originalFileName}
                          style={{
                            width: 110,
                            height: 82,
                            objectFit: 'cover',
                            borderRadius: 10,
                            border: '1px solid #E5E7EB',
                            cursor: 'pointer',
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </a>
                    ))}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {files
                  .filter((f) => !isImg(f.renameFileName))
                  .map((f) => (
                    <a
                      key={f.renameFileName}
                      href={`${PBOOTH_BASE}/${f.renameFileName}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid #E5E7EB',
                        background: '#FAFAFA',
                        color: '#111827',
                        fontWeight: 700,
                        fontSize: 13,
                        textDecoration: 'none',
                      }}
                    >
                      <span>📄</span>
                      <span>{f.originalFileName || f.renameFileName}</span>
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontSize: 11,
                          color: '#9CA3AF',
                        }}
                      >
                        다운로드
                      </span>
                    </a>
                  ))}
              </div>
            </>
          )}
        </Section>
      </div>
    </div>
  );
}
