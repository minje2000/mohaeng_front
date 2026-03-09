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
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: 18,
        padding: 20,
        background: '#FFFFFF',
        boxShadow: '0 6px 18px rgba(15, 23, 42, 0.04)',
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 26,
          color: '#111827',
          marginBottom: 14,
          letterSpacing: '-0.02em',
        }}
      >
        문의 작성
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="문의 내용을 입력하세요"
        rows={4}
        disabled={submitting}
        style={{
          width: '100%',
          borderRadius: 16,
          border: '1px solid #D1D5DB',
          padding: '16px 18px',
          fontSize: 16,
          lineHeight: 1.6,
          boxSizing: 'border-box',
          resize: 'vertical',
          minHeight: 120,
          outline: 'none',
          background: '#F9FAFB',
          color: '#111827',
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 12,
          marginTop: 14,
        }}
      >
        {error && (
          <div
            style={{
              fontSize: 13,
              color: '#DC2626',
            }}
          >
            등록 실패
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !content.trim()}
          style={{
            padding: '11px 18px',
            borderRadius: 12,
            border: 'none',
            background: submitting || !content.trim() ? '#E5E7EB' : '#111827',
            color: submitting || !content.trim() ? '#9CA3AF' : '#FFFFFF',
            fontSize: 15,
            fontWeight: 700,
            cursor: submitting || !content.trim() ? 'not-allowed' : 'pointer',
            minWidth: 96,
          }}
        >
          {submitting ? '등록 중...' : '등록'}
        </button>
      </div>
    </form>
  );
}
