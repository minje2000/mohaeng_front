import React, { useState } from 'react';
import UseReplyForm from '../hooks/UseReplyForm';

export default function ReplyForm({ inqId, initialReply, onSaved }) {
const [replyContent, setReplyContent] = useState(initialReply || '');

  const { create, update, remove, submitting } = UseReplyForm({
    onDone: () => onSaved?.(),
  });

  const onSubmit = (e) => {
    e.preventDefault();
    const c = replyContent.trim();
    if (!c) return;

    const dto = { replyContent: c };
    if (initialReply) update(inqId, dto);
    else create(inqId, dto);
  };

  const onDelete = () => {
    if (!window.confirm('답변을 삭제할까요?')) return;
    remove(inqId);
  };

  return (
    <form onSubmit={onSubmit} style={{ marginTop: 8, padding: 10, borderRadius: 10, background: '#fafafa' }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>답변</div>
      <textarea
        value={replyContent}
        onChange={(e) => setReplyContent(e.target.value)}
        rows={3}
        style={{ width: '100%', borderRadius: 10, border: '1px solid #ccc', padding: 10 }}
        placeholder="답변을 입력하세요"
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button type="submit" disabled={submitting} style={{ padding: '6px 10px' }}>
          {initialReply ? '답변 수정' : '답변 등록'}
        </button>
        {initialReply && (
          <button type="button" onClick={onDelete} disabled={submitting} style={{ padding: '6px 10px' }}>
            답변 삭제
          </button>
        )}
      </div>
    </form>
  );
}
