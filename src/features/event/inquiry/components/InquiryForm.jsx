import React, { useState } from 'react';
import UseInquiryForm from '../hooks/UseInquiryForm';
import { tokenStore } from '../../../../app/http/tokenStore';

export default function InquiryForm({ eventId, onSaved }) {
  const [content, setContent] = useState('');

  const { create, submitting, error } = UseInquiryForm({
    eventId,
    onDone: () => {
      setContent('');
      onSaved?.();
    },
  });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!eventId) return;

    // ✅ 문의 등록은 로그인 필요
    const token = tokenStore.getAccess();
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    const c = content.trim();
    if (!c) return;

    create({ content: c });
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{ border: '1px solid #ddd', borderRadius: 12, padding: 12 }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>문의 작성</div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="문의 내용을 입력하세요"
        rows={4}
        style={{
          width: '100%',
          borderRadius: 10,
          border: '1px solid #ccc',
          padding: 10,
        }}
      />

      <div
        style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}
      >
        <button
          type="submit"
          disabled={submitting}
          style={{ padding: '8px 12px' }}
        >
          {submitting ? '등록 중...' : '등록'}
        </button>
        {error && <span style={{ color: 'crimson' }}>등록 실패</span>}
      </div>
    </form>
  );
}