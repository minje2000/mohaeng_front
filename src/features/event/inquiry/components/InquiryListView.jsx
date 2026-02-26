import React, { useMemo, useState } from 'react';
import { tokenStore } from '../../../../app/http/tokenStore';
import { InquiryApi } from '../api/InquiryApi';
import ReplyForm from './ReplyForm';

function formatDateTime(v) {
  if (!v) return '';
  // v가 ISO 문자열/LocalDateTime 문자열(yyyy-MM-ddTHH:mm:ss)로 오는 케이스 대응
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString();
}

function IconButton({ title, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        border: '1px solid #e5e5e5',
        background: '#fff',
        borderRadius: 10,
        width: 34,
        height: 34,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

export default function InquiryListView({ items, onChanged, enableReply = true }) {
  const me = useMemo(() => Number(tokenStore.getUserId?.() || 0), []);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const startEdit = (it) => {
    setEditingId(it.inqId);
    setEditingText(it.content || '');
  };

  const saveEdit = async (inqId) => {
    const c = editingText.trim();
    if (!c) return;
    await InquiryApi.updateInquiry(inqId, { content: c });
    setEditingId(null);
    setEditingText('');
    onChanged?.();
  };

  const remove = async (inqId) => {
    if (!window.confirm('문의를 삭제할까요?')) return;
    await InquiryApi.deleteInquiry(inqId);
    onChanged?.();
  };

  if (!items?.length) {
    return <div style={{ padding: 12, color: '#666' }}>등록된 문의가 없습니다.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((it) => {
        const isMine = me && Number(it.userId) === me;
        const isEditing = editingId === it.inqId;
        const writerName = it.userName || it.writerName || it.name || `사용자#${it.userId}`;
        const createdText = formatDateTime(it.createdAt);

        return (
          <div key={it.inqId} style={{ border: '1px solid #e5e5e5', borderRadius: 12, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ fontWeight: 800 }}>{writerName}</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ color: '#777', fontSize: 12, minWidth: 140, textAlign: 'right' }}>
                  {createdText}
                </div>

                {isMine && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {!isEditing && (
                      <IconButton title="수정" onClick={() => startEdit(it)}>
                        {/* pencil */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 20H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </IconButton>
                    )}

                    <IconButton title="삭제" onClick={() => remove(it.inqId)}>
                      {/* trash */}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </IconButton>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
              {isEditing ? (
                <>
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    rows={3}
                    style={{ width: '100%', borderRadius: 10, border: '1px solid #ccc', padding: 10 }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={() => saveEdit(it.inqId)} style={{ padding: '6px 10px' }}>저장</button>
                    <button onClick={() => { setEditingId(null); setEditingText(''); }} style={{ padding: '6px 10px' }}>
                      취소
                    </button>
                  </div>
                </>
              ) : (
                it.content
              )}
            </div>

            {it.replyContent && (
              <div style={{ marginTop: 10, padding: 10, borderRadius: 10, background: '#f4f6ff' }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>답변</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{it.replyContent}</div>
              </div>
            )}

            {enableReply && (
              <ReplyForm
                inqId={it.inqId}
                initialReply={it.replyContent || ''}
                onSaved={onChanged}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
