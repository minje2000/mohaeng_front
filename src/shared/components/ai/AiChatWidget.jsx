import React, { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { tokenStore } from '../../../app/http/tokenStore';
import { fetchEventDetail } from '../../../features/event/api/EventDetailAPI';
import eventThumbUrl from '../../utils/eventThumbUrl';
import { sendAiChat } from '../../api/aiChatApi';

import { backendUrl } from '../../../app/http/axiosInstance';

const LOCATION_PATTERNS = [
  /((?:서울|부산|대구|인천|광주|대전|울산|세종|제주|경기|강원|충북|충남|전북|전남|경북|경남)\S*)/g,
  /((?:[가-힣]+)(?:시|도|군|구|읍|면|동))/g,
];

const QUICK_QUESTIONS = {
  map: [
    '강남 근처에서 열리는 행사 알려줘',
    '홍대 주변 행사 찾아줘',
    '서울에서 열리는 행사 추천해줘',
  ],
  calendar: [
    '이번 주 행사 알려줘',
    '이번 주말 행사 추천해줘',
    '이번 달 신청 가능한 행사 알려줘',
  ],
  board: [
    '지금 신청 가능한 행사 추천해줘',
    '요즘 인기 있는 행사 뭐 있어?',
    '무료로 참여할 수 있는 행사 있어?',
  ],
  mypage: [
    '내 행사 참여 내역 확인해줘',
    '행사 취소하면 환불 규정 어떻게 돼?',
    '문의는 어디서 남길 수 있어?',
  ],
};

const AI_SESSION_KEY = 'mohaeng_ai_session_id';

function getAiSessionId() {
  let value = sessionStorage.getItem(AI_SESSION_KEY);
  if (!value) {
    value = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(AI_SESSION_KEY, value);
  }
  return value;
}

const PAGE_LABEL = {
  map: '행사 지도',
  calendar: '행사 달력',
  board: '행사 게시판',
  mypage: '회원 마이페이지',
};

function BotIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3c4.97 0 9 3.58 9 8 0 2.45-1.24 4.65-3.19 6.11V21l-3.4-1.88A10.3 10.3 0 0 1 12 19c-4.97 0-9-3.58-9-8s4.03-8 9-8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="11" r="1.1" fill="currentColor" />
      <circle cx="15" cy="11" r="1.1" fill="currentColor" />
      <path
        d="M8.5 14.2c1 .72 2.06 1.08 3.5 1.08 1.44 0 2.5-.36 3.5-1.08"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M21 3 10 14"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="m21 3-7 18-4-7-7-4 18-7Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function pickFirst(...values) {
  return values.find(
    (value) =>
      value !== undefined && value !== null && String(value).trim() !== ''
  );
}

function pickNumber(...values) {
  const raw = pickFirst(...values);
  if (raw === undefined || raw === null || raw === '') return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizePeriod(startDate, endDate, period) {
  if (period && String(period).trim()) return String(period).trim();
  const start = startDate ? String(startDate).trim() : '';
  const end = endDate ? String(endDate).trim() : '';
  return [start, end].filter(Boolean).join(' ~ ');
}

function cleanRegionText(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object') {
    const parent = String(
      value.parentName || value.parentRegionName || ''
    ).trim();
    const region = String(value.regionName || value.name || '').trim();
    if (region && parent && region.startsWith(parent)) return region;
    return [parent, region].filter(Boolean).join(' ');
  }
  return String(value).trim();
}

function buildRegionText(...values) {
  const normalized = [];
  values.forEach((value) => {
    const text = cleanRegionText(value);
    if (text && !normalized.includes(text)) normalized.push(text);
  });
  return normalized[0] || '';
}

function extractLocationKeywords(question) {
  const source = String(question || '');
  const found = [];

  for (const pattern of LOCATION_PATTERNS) {
    const matches = source.match(pattern) || [];
    matches.forEach((item) => {
      const normalized = String(item || '')
        .replace(/[은는이가요를을에에서근처쪽쪽은\s]+$/g, '')
        .trim();
      if (normalized && !found.includes(normalized)) found.push(normalized);
    });
  }

  const aliases = [
    ['강남', '서울'],
    ['잠실', '서울'],
    ['홍대', '서울'],
    ['성수', '서울'],
    ['판교', '경기'],
    ['해운대', '부산'],
    ['전주', '전북'],
    ['제주', '제주'],
  ];

  aliases.forEach(([keyword, region]) => {
    if (source.includes(keyword) && !found.includes(keyword))
      found.push(keyword);
    if (source.includes(keyword) && !found.includes(region)) found.push(region);
  });

  return found.slice(0, 5);
}

function normalizeSingleEvent(item, index) {
  const source = item?.event || item?.eventInfo || item?.data || item || {};
  const eventId = pickNumber(
    source?.eventId,
    source?.id,
    source?.EVENT_ID,
    item?.eventId,
    item?.id,
    item?.EVENT_ID,
    item?.event_id,
    source?.event_id
  );

  const title = pickFirst(
    source?.title,
    source?.eventTitle,
    item?.title,
    item?.eventTitle,
    '추천 행사'
  );
  const description = pickFirst(
    source?.simpleExplain,
    source?.description,
    source?.eventDesc,
    item?.simpleExplain,
    item?.description,
    item?.eventDesc,
    ''
  );
  const thumbnail = pickFirst(
    source?.thumbnail,
    source?.thumbUrl,
    source?.imageUrl,
    item?.thumbnail,
    item?.thumbUrl,
    item?.imageUrl,
    ''
  );
  const region = buildRegionText(
    source?.region,
    source?.regionName,
    source?.lotNumberAdr,
    item?.region,
    item?.regionName,
    item?.lotNumberAdr
  );

  const startDate = pickFirst(
    source?.startDate,
    source?.start_date,
    item?.startDate,
    item?.start_date,
    ''
  );
  const endDate = pickFirst(
    source?.endDate,
    source?.end_date,
    item?.endDate,
    item?.end_date,
    ''
  );
  const status = pickFirst(
    source?.eventStatus,
    source?.status,
    item?.eventStatus,
    item?.status,
    ''
  );
  const applyUrl = pickFirst(
    source?.applyUrl,
    item?.applyUrl,
    status === '행사참여모집중' && eventId ? `/events/${eventId}/apply` : ''
  );

  return {
    key: eventId || `${index}`,
    eventId,
    title: String(title),
    description: String(description || ''),
    thumbnail: thumbnail ? eventThumbUrl(thumbnail) : '/images/moheng.png',
    region: String(region || ''),
    startDate: String(startDate || ''),
    endDate: String(endDate || ''),
    period: normalizePeriod(
      startDate,
      endDate,
      pickFirst(source?.period, item?.period, '')
    ),
    eventStatus: String(status || ''),
    detailUrl: eventId ? `/events/${eventId}` : '',
    applyUrl: applyUrl || '',
    canApply: status === '행사참여모집중',
    scoreReason: String(pickFirst(source?.scoreReason, item?.scoreReason, '') || ''),
    price: pickNumber(source?.price, item?.price),
  };
}

function normalizeEvents(payload) {
  const candidates = [
    payload?.events,
    payload?.recommendations,
    payload?.cards,
    payload?.data?.events,
    payload?.result?.events,
  ].find(Array.isArray);
  return (candidates || []).slice(0, 6).map(normalizeSingleEvent);
}

async function enrichEvents(events) {
  const enriched = await Promise.all(
    (events || []).map(async (event) => {
      if (!event?.eventId) return event;
      if (event.description && event.period && event.region) return event;
      try {
        const detail = await fetchEventDetail(event.eventId);
        const info = detail?.eventInfo || detail || {};
        const startDate = pickFirst(info?.startDate, event.startDate, '');
        const endDate = pickFirst(info?.endDate, event.endDate, '');
        return {
          ...event,
          title: String(pickFirst(info?.title, event.title, '추천 행사')),
          description: String(
            pickFirst(
              info?.simpleExplain,
              info?.description,
              event.description,
              ''
            )
          ),
          thumbnail: eventThumbUrl(
            pickFirst(info?.thumbnail, event.thumbnail, '/images/moheng.png')
          ),
          region: buildRegionText(
            info?.region,
            info?.regionName,
            event.region,
            info?.lotNumberAdr
          ),
          startDate: String(startDate || ''),
          endDate: String(endDate || ''),
          period: normalizePeriod(startDate, endDate, event.period),
          eventStatus: String(
            pickFirst(info?.eventStatus, event.eventStatus, '')
          ),
          canApply:
            pickFirst(info?.eventStatus, event.eventStatus, '') ===
            '행사참여모집중',
          applyUrl:
            pickFirst(info?.eventStatus, event.eventStatus, '') ===
            '행사참여모집중'
              ? `/events/${event.eventId}/apply`
              : '',
        };
      } catch {
        return event;
      }
    })
  );
  return enriched;
}


function normalizeSources(payload) {
  const list = Array.isArray(payload?.sources) ? payload.sources : [];
  return list
    .map((item, index) => ({
      key: `${item?.type || 'source'}-${index}`,
      type: String(item?.type || 'source'),
      title: String(item?.title || '참고 자료'),
      snippet: String(item?.snippet || ''),
    }))
    .filter((item) => item.title || item.snippet);
}

function normalizeRecommendationReasons(payload) {
  const list = Array.isArray(payload?.recommendationReasons)
    ? payload.recommendationReasons
    : [];
  return list.map((item, index) => ({ key: `reason-${index}`, text: String(item || '') })).filter((item) => item.text);
}

function normalizeNextActions(payload) {
  const list = Array.isArray(payload?.nextActions) ? payload.nextActions : [];
  return list
    .map((item, index) => ({
      key: `action-${index}`,
      label: String(item?.label || '바로가기'),
      actionType: String(item?.actionType || 'prompt'),
      value: String(item?.value || ''),
      variant: String(item?.variant || 'secondary'),
    }))
    .filter((item) => item.label && item.actionType);
}

function normalizeAnswer(payload) {
  return (
    payload?.answer ||
    payload?.message ||
    payload?.reply ||
    payload?.content ||
    payload?.data?.answer ||
    '지금은 답변을 가져오지 못했어요. 잠시 후 다시 시도해주세요.'
  );
}

export default function AiChatWidget({ pageType = 'board' }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      role: 'assistant',
      text: `${PAGE_LABEL[pageType] || '행사'} 화면 전용 AI예요. 지역, 일정, 신청 가능 여부, 환불 규정, 결제/환불/부스 상태까지 바로 도와드릴게요.`,
      events: [],
      sources: [],
      reasons: [],
      nextActions: [],
    },
  ]);

  const quickQuestions = useMemo(
    () => QUICK_QUESTIONS[pageType] || QUICK_QUESTIONS.board,
    [pageType]
  );

  const moveToEventDetail = (eventId) => {
    if (!eventId) return;
    navigate(`/events/${eventId}`);
  };

  const moveToApply = (eventId) => {
    if (!eventId) return;
    navigate(`/events/${eventId}/apply`);
  };

  const runNextAction = (action) => {
    if (!action) return;
    if (action.actionType === 'navigate') {
      if (action.value) navigate(action.value);
      return;
    }
    if (action.actionType === 'prompt') {
      sendMessage(action.value);
      return;
    }
    if (action.actionType === 'link') {
      if (action.value) window.open(action.value, '_blank', 'noopener,noreferrer');
    }
  };

  const sendMessage = async (raw) => {
    const question = String(raw || input).trim();
    if (!question || loading) return;

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: question, events: [], sources: [], reasons: [], nextActions: [] },
    ]);
    setInput('');
    setLoading(true);

    try {
      const accessToken = tokenStore.getAccess();
      const locationKeywords = extractLocationKeywords(question);
      const region = locationKeywords[0] || '';
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      }));
      const sessionId = getAiSessionId();

      const response = await fetch(`${backendUrl}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          question,
          message: question,
          pageType,
          contextPage: pageType,
          region,
          location: region,
          locationKeywords,
          filters: { region, locations: locationKeywords },
          history,
          sessionId,
        }),
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      const payload = await sendAiChat({
        question,
        message: question,
        pageType,
        contextPage: pageType,
        region,
        location: region,
        locationKeywords,
        filters: { region, locations: locationKeywords },
        history,
        sessionId,
      });

      const normalizedEvents = normalizeEvents(payload);
      const resolvedEvents = await enrichEvents(normalizedEvents);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: normalizeAnswer(payload),
          events: resolvedEvents,
          sources: normalizeSources(payload),
          reasons: normalizeRecommendationReasons(payload),
          nextActions: normalizeNextActions(payload),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: error?.response?.data?.message || error?.response?.data?.detail || error?.message || 'AI 서버 연결에 실패했습니다.',
          events: [],
          sources: [],
          reasons: [],
          nextActions: [],
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const floatingUi = (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="AI 챗봇 열기"
        style={{
          position: 'fixed',
          right: 28,
          bottom: 28,
          zIndex: 2147483000,
          width: 64,
          height: 64,
          border: 'none',
          borderRadius: 999,
          background: 'linear-gradient(135deg, #FFD84D 0%, #FFB800 100%)',
          color: '#111827',
          boxShadow: '0 20px 40px rgba(17, 24, 39, 0.22)',
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <BotIcon />
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            right: 20,
            top: 20,
            bottom: 100,
            zIndex: 2147483001,
            width: 'min(420px, calc(100vw - 20px))',
            maxHeight: 'calc(100vh - 40px)',
            background: 'rgba(255,255,255,0.98)',
            border: '1px solid rgba(255, 216, 77, 0.7)',
            borderRadius: 28,
            overflow: 'hidden',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 24px 60px rgba(17, 24, 39, 0.18)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '18px 20px 16px',
              background: 'linear-gradient(135deg, #FFF4BF 0%, #FFE58F 100%)',
              borderBottom: '1px solid rgba(17, 24, 39, 0.06)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 16,
                    background: '#111827',
                    color: '#FFD84D',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <BotIcon />
                </div>
                <div>
                  <div
                    style={{ fontSize: 17, fontWeight: 900, color: '#111827' }}
                  >
                    MOHAENG AI 챗봇
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#4B5563',
                      marginTop: 3,
                    }}
                  >
                    {PAGE_LABEL[pageType] || '행사'} 전용 도우미
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  border: '1px solid rgba(17, 24, 39, 0.08)',
                  background: '#fff',
                  fontSize: 18,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                marginTop: 14,
              }}
            >
              {quickQuestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => sendMessage(item)}
                  style={{
                    border: '1px solid rgba(17, 24, 39, 0.08)',
                    background: 'rgba(255,255,255,0.9)',
                    color: '#374151',
                    borderRadius: 999,
                    padding: '9px 12px',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '18px 16px 16px',
              background: '#FFFDF7',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems:
                      message.role === 'user' ? 'flex-end' : 'flex-start',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      maxWidth: '88%',
                      padding: '14px 16px',
                      borderRadius:
                        message.role === 'user'
                          ? '20px 20px 6px 20px'
                          : '20px 20px 20px 6px',
                      background: message.role === 'user' ? '#111827' : '#fff',
                      color: message.role === 'user' ? '#fff' : '#1F2937',
                      border:
                        message.role === 'user'
                          ? 'none'
                          : '1px solid rgba(17, 24, 39, 0.06)',
                      boxShadow: '0 10px 20px rgba(17, 24, 39, 0.05)',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.55,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {message.text}
                  </div>
                  {Array.isArray(message.events) &&
                    message.events.length > 0 && (
                      <div style={{ width: '100%', display: 'grid', gap: 10 }}>
                        {message.events.map((event) => (
                          <div
                            key={event.key}
                            style={{
                              textAlign: 'left',
                              border: '1px solid rgba(17, 24, 39, 0.08)',
                              background: '#fff',
                              borderRadius: 18,
                              padding: 12,
                              display: 'grid',
                              gridTemplateColumns: '84px 1fr',
                              gap: 12,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => moveToEventDetail(event.eventId)}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                padding: 0,
                                margin: 0,
                                cursor: event.eventId ? 'pointer' : 'default',
                                width: 84,
                                height: 84,
                                borderRadius: 14,
                                overflow: 'hidden',
                              }}
                            >
                              <img
                                src={event.thumbnail || '/images/moheng.png'}
                                alt={event.title}
                                style={{
                                  width: 84,
                                  height: 84,
                                  objectFit: 'cover',
                                  display: 'block',
                                }}
                                onError={(e) => {
                                  e.currentTarget.src = '/images/moheng.png';
                                }}
                              />
                            </button>
                            <div style={{ minWidth: 0 }}>
                              <button
                                type="button"
                                onClick={() => moveToEventDetail(event.eventId)}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  padding: 0,
                                  margin: '0 0 6px 0',
                                  cursor: event.eventId ? 'pointer' : 'default',
                                  fontSize: 14,
                                  fontWeight: 900,
                                  color: '#111827',
                                  textAlign: 'left',
                                  lineHeight: 1.45,
                                }}
                              >
                                {event.title}
                              </button>
                              {event.description ? (
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: '#4B5563',
                                    lineHeight: 1.45,
                                    marginBottom: 8,

                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {event.description}
                                </div>
                              ) : null}
                              <div
                                style={{
                                  fontSize: 11,
                                  fontWeight: 800,
                                  color: '#6B7280',
                                  marginBottom: 10,
                                }}
                              >
                                {event.region && (
                                  <div style={{ marginBottom: 2 }}>
                                    지역 {event.region}
                                  </div>
                                )}

                                {event.period && <div>기간 {event.period}</div>}
                                {event.scoreReason ? (
                                  <div style={{ marginTop: 6, color: '#92400E' }}>추천 이유 {event.scoreReason}</div>
                                ) : null}
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  gap: 8,
                                  flexWrap: 'wrap',
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    moveToEventDetail(event.eventId)
                                  }
                                  style={{
                                    border: '1px solid #E5E7EB',
                                    background: '#fff',
                                    borderRadius: 999,
                                    padding: '8px 12px',
                                    fontSize: 12,
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                  }}
                                >
                                  상세보기
                                </button>
                                {event.canApply ? (
                                  <button
                                    type="button"
                                    onClick={() => moveToApply(event.eventId)}
                                    style={{
                                      border: 'none',
                                      background: '#111827',
                                      color: '#FFD84D',
                                      borderRadius: 999,
                                      padding: '8px 12px',
                                      fontSize: 12,
                                      fontWeight: 900,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    신청하기
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  {Array.isArray(message.reasons) && message.reasons.length > 0 && (
                    <div style={{ width: '100%', display: 'grid', gap: 8 }}>
                      <div style={{ maxWidth: '88%', padding: '12px 14px', borderRadius: 16, background: '#FFF7D6', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                        <div style={{ fontSize: 12, fontWeight: 900, color: '#92400E', marginBottom: 6 }}>추천 이유</div>
                        <div style={{ display: 'grid', gap: 6 }}>
                          {message.reasons.map((reason) => (
                            <div key={reason.key} style={{ fontSize: 12, fontWeight: 700, color: '#7C2D12' }}>• {reason.text}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {Array.isArray(message.sources) && message.sources.length > 0 && (
                    <div style={{ width: '100%', display: 'grid', gap: 8 }}>
                      <div style={{ maxWidth: '88%', padding: '12px 14px', borderRadius: 16, background: '#EFF6FF', border: '1px solid rgba(59, 130, 246, 0.18)' }}>
                        <div style={{ fontSize: 12, fontWeight: 900, color: '#1D4ED8', marginBottom: 8 }}>참고 출처</div>
                        <div style={{ display: 'grid', gap: 8 }}>
                          {message.sources.map((source) => (
                            <div key={source.key} style={{ padding: '10px 12px', borderRadius: 14, background: '#fff', border: '1px solid rgba(17, 24, 39, 0.06)' }}>
                              <div style={{ fontSize: 12, fontWeight: 900, color: '#111827', marginBottom: 4 }}>{source.title}</div>
                              <div style={{ fontSize: 12, lineHeight: 1.5, color: '#6B7280' }}>{source.snippet}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {Array.isArray(message.nextActions) && message.nextActions.length > 0 && (
                    <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {message.nextActions.map((action) => (
                        <button
                          key={action.key}
                          type="button"
                          onClick={() => runNextAction(action)}
                          style={{
                            border: action.variant === 'primary' ? 'none' : '1px solid rgba(17, 24, 39, 0.08)',
                            background: action.variant === 'primary' ? '#111827' : '#fff',
                            color: action.variant === 'primary' ? '#FFD84D' : '#111827',
                            borderRadius: 999,
                            padding: '10px 14px',
                            fontSize: 12,
                            fontWeight: 900,
                            cursor: 'pointer',
                          }}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {loading ? (
                <div
                  style={{
                    alignSelf: 'flex-start',
                    background: '#fff',
                    border: '1px solid rgba(17, 24, 39, 0.06)',
                    borderRadius: '20px 20px 20px 6px',
                    padding: '13px 16px',
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#6B7280',
                  }}
                >
                  답변을 정리하고 있어요...
                </div>
              ) : null}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            style={{
              padding: 14,
              background: '#fff',
              borderTop: '1px solid rgba(17, 24, 39, 0.06)',
            }}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                placeholder="무엇을 도와드릴까요?"
                style={{
                  flex: 1,
                  minHeight: 52,
                  maxHeight: 120,
                  resize: 'vertical',
                  borderRadius: 18,
                  border: '1px solid rgba(17, 24, 39, 0.1)',
                  padding: '14px 16px',
                  fontSize: 14,
                  outline: 'none',
                  lineHeight: 1.4,
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{
                  width: 52,
                  height: 52,
                  border: 'none',
                  borderRadius: 18,
                  background: loading || !input.trim() ? '#E5E7EB' : '#111827',
                  color: loading || !input.trim() ? '#9CA3AF' : '#FFD84D',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <SendIcon />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );

  if (typeof document === 'undefined') return floatingUi;
  return createPortal(floatingUi, document.body);
}
