import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignupForm } from '../hooks/useSignupForm';
import { usePhoneVerification } from '../hooks/usePhoneVerification';
import { useModal } from '../hooks/usePerInfoTermsModal';
import SignUpTerms from '../pages/SignUpTerms';
import styles from '../styles/SignUp.module.css';

const Step3CorporateForm = ({ onBack }) => {
  const navigate = useNavigate();
  const { isOpen, openModal, closeModal } = useModal();

  // 사업자 인증 상태
  const [bizFile,        setBizFile]        = useState(null);
  const [bizVerified,    setBizVerified]     = useState(false);   // 인증 완료 여부
  const [bizVerifying,   setBizVerifying]    = useState(false);   // 인증 중
  const [bizMessage,     setBizMessage]      = useState('');      // 인증 결과 메시지
  const [bizSuccess,     setBizSuccess]      = useState(null);    // true/false/null
  const [bizNumber,      setBizNumber]       = useState('');      // 추출된 사업자번호

  const {
    formData,
    handleChange,
    handleIdCheck,
    handleSubmit,
    isIdAvailable,
    isLoading,
    isPasswordValid,
    err,
  } = useSignupForm({
    email: '',
    userPwd: '',
    name: '',
    businessFile: null,
    agreement: false,
  });

  const {
    phone, verifiedCode, smsMessage, isSendSms,
    verificationMessage, isVerified,
    handlePhoneChange, handleCodeChange, sendSms, verifyCode
  } = usePhoneVerification();

  // 파일 선택 핸들러
  const handleBizFileChange = (e) => {
    const file = e.target.files[0];
    setBizFile(file);
    // 파일 바꾸면 인증 초기화
    setBizVerified(false);
    setBizSuccess(null);
    setBizMessage('');
    setBizNumber('');
    // useSignupForm의 businessFile도 동기화
    handleChange(e);
  };

  // 인증하기 클릭
  const handleVerifyBiz = async () => {
    if (!bizFile) {
      alert('사업자등록증 파일을 먼저 업로드해주세요.');
      return;
    }
    setBizVerifying(true);
    setBizMessage('');
    setBizSuccess(null);

    try {
      const formData = new FormData();
      formData.append('businessFile', bizFile);

      const res = await fetch('http://localhost:8080/api/user/verifyBiz', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setBizVerified(true);
        setBizSuccess(true);
        setBizNumber(json.data?.businessNumber || '');
        setBizMessage(`인증 완료! (사업자번호: ${json.data?.businessNumber || ''})`);
      } else {
        setBizVerified(false);
        setBizSuccess(false);
        setBizMessage(json.message || '유효하지 않은 사업자등록증입니다.');
      }
    } catch (e) {
      setBizVerified(false);
      setBizSuccess(false);
      setBizMessage('인증 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setBizVerifying(false);
    }
  };

  // 회원가입 제출 — 인증 완료 여부 추가 체크
  const handleFormSubmit = (e) => {
    if (!bizVerified) {
      e.preventDefault();
      alert('사업자 인증을 먼저 완료해주세요.');
      return;
    }
    handleSubmit(e, 'COMPANY', navigate, phone, isVerified);
  };

  return (
    <div className={styles.formContainer}>
      <form
        onSubmit={handleFormSubmit}
        className={styles.formContainer}
        style={{ gap: '12px' }}
      >
        {/* 이메일 */}
        <div className={styles.inputRow}>
          <label className={styles.label}>이메일(ID)</label>
          <div className={styles.inputGroup}>
            <div className={styles.inputWithBtn}>
              <input
                className={styles.input}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <button type="button" className={styles.actionBtn} onClick={handleIdCheck}>
                중복 확인
              </button>
            </div>
            {isIdAvailable !== null && (
              <div className={styles.helperText} style={{ color: isIdAvailable ? 'green' : 'crimson' }}>
                {isIdAvailable ? '사용 가능한 이메일입니다.' : '이미 사용 중인 이메일입니다.'}
              </div>
            )}
          </div>
        </div>

        {/* 비밀번호 */}
        <div className={styles.inputRow}>
          <label className={styles.label}>비밀번호</label>
          <div className={styles.inputGroup}>
            <input
              className={styles.input}
              type="password"
              name="userPwd"
              value={formData.userPwd}
              onChange={handleChange}
              required
            />
            <div className={styles.helperText} style={{ color: isPasswordValid ? 'green' : 'crimson' }}>
              {isPasswordValid ? '사용 가능한 비밀번호입니다.' : '영문자, 숫자 조합 8자리 이상이여야 합니다.'}
            </div>
          </div>
        </div>

        {/* 회사명 */}
        <div className={styles.inputRow}>
          <label className={styles.label}>회사명</label>
          <input
            className={styles.input}
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* 사업자등록증 + 인증하기 */}
        <div className={styles.inputRow}>
          <label className={styles.label}>사업자<br/>등록증</label>
          <div className={styles.inputGroup}>
            <div className={styles.inputWithBtn}>
              <input
                className={styles.fileInput}
                type="file"
                name="businessFile"
                accept="image/*,application/pdf"
                onChange={handleBizFileChange}
                style={{ minWidth: 0, flex: 1 }}
              />
              <button
                type="button"
                className={styles.actionBtn}
                onClick={handleVerifyBiz}
                disabled={bizVerifying || !bizFile}
                style={{
                  background: bizVerified ? '#16a34a' : undefined,
                  color: bizVerified ? '#fff' : undefined,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {bizVerifying ? '인증 중...' : bizVerified ? '인증완료 ✓' : '인증하기'}
              </button>
            </div>

            {/* 인증 결과 메시지 */}
            {bizMessage && (
              <div
                className={styles.helperText}
                style={{ color: bizSuccess ? 'green' : 'crimson', fontWeight: 600 }}
              >
                {bizSuccess ? '✅ ' : '❌ '}{bizMessage}
              </div>
            )}

            {/* 파일만 선택되고 인증 전 */}
            {bizFile && !bizMessage && (
              <div className={styles.helperText} style={{ color: '#888' }}>
                파일 선택 완료. "인증하기"를 눌러 사업자 인증을 완료해주세요.
              </div>
            )}

            {/* 파일 미선택 */}
            {!bizFile && (
              <div className={styles.helperText}>
                사업자등록증 파일을 업로드해주세요.
              </div>
            )}
          </div>
        </div>

        {/* 전화번호 */}
        <div className={styles.inputRow}>
          <label className={styles.label}>전화번호</label>
          <div className={styles.inputGroup}>
            <div className={styles.inputWithBtn}>
              <input
                className={styles.input}
                type="tel"
                name="phone"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="-없이 숫자만 입력"
                maxLength={11}
                required
              />
              <button type="button" className={styles.actionBtn} onClick={sendSms}>본인 인증</button>
            </div>
            <div className={styles.helperText} style={{ color: isSendSms ? 'green' : 'crimson' }}>
              {isSendSms ? smsMessage : '전화번호 입력 후 본인 인증 바랍니다.'}
            </div>
          </div>
        </div>

        {/* 인증번호 */}
        <div className={styles.inputRow}>
          <label className={styles.label}>인증번호</label>
          <div className={styles.inputGroup}>
            <div className={styles.inputWithBtn}>
              <input
                className={styles.input}
                type="text"
                name="verifiedCode"
                value={verifiedCode}
                onChange={handleCodeChange}
                required
              />
              <button type="button" className={styles.actionBtn} onClick={verifyCode}>확인</button>
            </div>
            {verificationMessage && (
              <div className={styles.helperText} style={{ color: isVerified ? 'green' : 'crimson' }}>
                {verificationMessage}
              </div>
            )}
          </div>
        </div>

        {/* 개인정보 동의 */}
        <div className={styles.agreementWrapper}>
          <input
            type="checkbox"
            id="agree"
            name="agreement"
            checked={formData.agreement}
            onChange={handleChange}
          />
          <label htmlFor="agree" style={{ marginLeft: '5px' }}>
            [필수] 개인 정보 수집 및 이용 동의
          </label>
          <button
            type="button"
            onClick={openModal}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: '#888', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px'
            }}
          >
            보기
          </button>
        </div>

        {/* 약관 모달 */}
        {isOpen && (
          <div
            style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center',
              alignItems: 'center', zIndex: 9999, padding: '20px'
            }}
            onClick={closeModal}
          >
            <div style={{ width: '100%', maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
              <SignUpTerms onClose={closeModal} />
            </div>
          </div>
        )}

        {err && <div style={{ color: 'crimson', fontSize: 13 }}>{err}</div>}

        {/* 가입 버튼 — 인증 미완료시 흐리게 */}
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isLoading || !bizVerified}
          style={{ opacity: bizVerified ? 1 : 0.5, cursor: bizVerified ? 'pointer' : 'not-allowed' }}
        >
          {isLoading ? '처리 중...' : '회원 가입'}
        </button>
      </form>

      <button className={styles.backBtn} onClick={onBack} disabled={isLoading}>
        뒤로가기
      </button>
    </div>
  );
};

export default Step3CorporateForm;
