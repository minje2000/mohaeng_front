import React, { useEffect, useMemo, useState } from 'react';
import UseReplyForm from '../hooks/UseReplyForm';

export default function ReplyForm({ inqId, initialReply, onSaved }) {
  const [replyContent, setReplyContent] = useState(initialReply || '');

  // ✅ refetch 후 initialReply 갱신되면 textarea도 동기화
  useEffect(() => {
    setReplyContent(initialReply || '');
  }, [initialReply, inqId]);

  const hasReply = useMemo(() => {
    return !!(initialReply && String(initialReply).trim().length > 0);
  }, [initialReply]);

  const { create, update, remove, submitting } = UseReplyForm({
    onDone: () => onSaved?.(),
  });

  const onSubmit = (e) => {
    e.preventDefault();
    const c = replyContent.trim();
    if (!c) return;

    const dto = { replyContent: c };
    if (hasReply) update(inqId, dto);
    else create(inqId, dto);
  };

  const onDelete = () => {
    if (!window.confirm('답변을 삭제할까요?')) return;
    remove(inqId);
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{
        border: '1px solid #e9e9e9',
        borderRadius: 14,
        padding: 10,
        background: '#fafafa',
      }}
    >
      <textarea
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        rows={3}
        placeholder="댓글 달듯이 답변을 입력하세요"
        style={{
          width: '100%',
          borderRadius: 12,
          border: '1px solid #ccc',
          padding: 10,
          resize: 'vertical',
        }}
      />

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '7px 12px',
            borderRadius: 999,
            border: '1px solid #ddd',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          {hasReply ? '답변 수정' : '답변 등록'}
        </button>

        {hasReply && (
          <button
            type="button"
            onClick={onDelete}
            disabled={submitting}
            style={{
              padding: '7px 12px',
              borderRadius: 999,
              border: '1px solid #ddd',
              background: '#fff',
              cursor: 'pointer',
              color: '#d11a2a',
            }}
          >
            답변 삭제
          </button>
        )}
      </div>
    </form>
  );
}
