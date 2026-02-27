import React, { useMemo, useState } from 'react';
import ReplyForm from './ReplyForm';
import { InquiryApi } from '../api/InquiryApi';

function fmt(v) {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString();
}

function PencilIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 20H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 6h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 6V4h8v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 6l-1 14H6L5 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 11v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconBtn({ title, onClick, danger, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        border: '1px solid #e5e5e5',
        background: '#fff',
        borderRadius: 999,
        width: 34,
        height: 34,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: danger ? '#d11a2a' : '#111',
      }}
    >
      {children}
    </button>
  );
}

function Bubble({ side = 'left', children }) {
  const isRight = side === 'right';
  return (
    <div
      style={{
        maxWidth: '78%',
        alignSelf: isRight ? 'flex-end' : 'flex-start',
        background: isRight ? '#FFE56B' : '#F2F3F5',
        color: '#111',
        borderRadius: 18,
        padding: '10px 12px',
        whiteSpace: 'pre-wrap',
        lineHeight: 1.35,
        boxShadow: '0 1px 0 rgba(0,0,0,0.05)',
      }}
    >
      {children}
    </div>
  );
}

export default function InquiryListView({
  items,
  meId,
  isHost,
  hostName = '주최자',
  onChanged,
}) {
  // 답변 토글: 어떤 문의가 열려있는지
  const [openMap, setOpenMap] = useState({});

  // 수정 모드
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const toggleOpen = (inqId) => {
    setOpenMap((prev) => ({ ...prev, [inqId]: !prev[inqId] }));
  };

  const startEdit = (it) => {
    setEditingId(it.inqId);
    setEditingText(it.content || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const saveEdit = async (inqId) => {
    const c = editingText.trim();
    if (!c) return;
    await InquiryApi.updateInquiry(inqId, { content: c });
    cancelEdit();
    onChanged?.();
  };

  const remove = async (inqId) => {
    if (!window.confirm('문의를 삭제할까요?')) return;
    await InquiryApi.deleteInquiry(inqId);
    onChanged?.();
  };

  if (!items?.length) {
    return (
      <div style={{ padding: 12, color: '#666' }}>등록된 문의가 없습니다.</div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {items.map((it) => {
        console.log('[inq]', {
          meId,
          isHost,
          itemUserId: it.userId,
          isMine: meId != null && Number(it.userId) === Number(meId),
        });

        const isMine = meId != null && Number(it.userId) === Number(meId);
        const isEditing = editingId === it.inqId;

        const writerName = it.userName || `사용자#${it.userId}`;
        const createdAt = fmt(it.createdAt);

        const hasReply = !!(it.replyContent && String(it.replyContent).trim());
        const isOpen = !!openMap[it.inqId];

        return (
          <div
            key={it.inqId}
            style={{
              border: '1px solid #e9e9e9',
              borderRadius: 14,
              padding: 12,
              background: '#fff',
            }}
          >
            {/* 상단 메타 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontWeight: 800 }}>{writerName}</div>
                <div style={{ fontSize: 12, color: '#777' }}>{createdAt}</div>
              </div>

              {/* 내 글만 수정/삭제 아이콘 */}
              {isMine && (
                <div style={{ display: 'flex', gap: 8 }}>
                  {!isEditing && (
                    <IconBtn title="수정" onClick={() => startEdit(it)}>
                      <PencilIcon />
                    </IconBtn>
                  )}
                  <IconBtn title="삭제" danger onClick={() => remove(it.inqId)}>
                    <TrashIcon />
                  </IconBtn>
                </div>
              )}
            </div>

            {/* 카톡 느낌: 질문 말풍선 */}
            <div
              style={{
                marginTop: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {isEditing ? (
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      borderRadius: 12,
                      border: '1px solid #ccc',
                      padding: 10,
                      resize: 'vertical',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => saveEdit(it.inqId)}
                      style={{ padding: '7px 12px', borderRadius: 10 }}
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      style={{ padding: '7px 12px', borderRadius: 10 }}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <Bubble side={isMine ? 'right' : 'left'}>{it.content}</Bubble>
              )}
            </div>

            {/* 답변 버튼 (답변이 있거나 주최자면 표시) */}
            {(hasReply || isHost) && (
              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  justifyContent: 'flex-start',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleOpen(it.inqId)}
                  style={{
                    border: '1px solid #e5e5e5',
                    background: '#fff',
                    borderRadius: 999,
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  {isOpen ? '답변 닫기' : hasReply ? '답변 보기' : '답변하기'}
                </button>
              </div>
            )}

            {/* 토글 열림: 답변(말풍선 + 들여쓰기) + 주최자 댓글 입력 */}
            {isOpen && (
              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {hasReply && (
                  <div
                    style={{
                      marginLeft: 18,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ fontSize: 12, color: '#666' }}>
                      {hostName}
                      {it.replyDate ? ` · ${fmt(it.replyDate)}` : ''}
                    </div>
                    <Bubble side="left">{it.replyContent}</Bubble>
                  </div>
                )}

                {/* 주최자만 댓글처럼 답변 폼 */}
                {isHost && (
                  <div style={{ marginLeft: 18 }}>
                    <ReplyForm
                      inqId={it.inqId}
                      initialReply={it.replyContent || ''}
                      onSaved={() => {
                        onChanged?.();
                        // 원하면 저장 후 자동으로 닫기:
                        // setOpenMap((p) => ({ ...p, [it.inqId]: false }));
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
