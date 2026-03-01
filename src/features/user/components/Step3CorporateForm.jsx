import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignupForm } from '../hooks/useSignupForm';
import { usePhoneVerification } from '../hooks/usePhoneVerification';
import styles from '../styles/SignUp.module.css';

const Step3CorporateForm = ({ onBack }) => {
  const navigate = useNavigate();

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
    businessNum: '',
    agreement: false, 
  });

  // 본인인증 전용 훅
    const {
      phone, verifiedCode, smsMessage, isSendSms, 
      verificationMessage, isVerified, 
      handlePhoneChange, handleCodeChange, sendSms, verifyCode
    } = usePhoneVerification();

  return (
    <div className={styles.formContainer}>
      <form
        onSubmit={(e) => handleSubmit(e, 'COMPANY', navigate, phone, isVerified)}
        className={styles.formContainer}
        style={{ gap: '12px' }}
      >
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
              <button
                type="button"
                className={styles.actionBtn}
                onClick={handleIdCheck}
              >
                중복 확인
              </button>
            </div>
            {isIdAvailable !== null && (
              <div
                className={styles.helperText}
                style={{ color: isIdAvailable ? 'green' : 'crimson' }}
              >
                {isIdAvailable
                  ? '사용 가능한 이메일입니다.'
                  : '이미 사용 중인 이메일입니다.'}
              </div>
            )}
          </div>
        </div>
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
            <div
              className={styles.helperText}
              style={{ color: isPasswordValid ? 'green' : 'crimson' }}
            >
              {isPasswordValid
                ? '사용 가능한 비밀번호입니다.'
                : '영문자, 숫자 조합 8자리 이상이여야 합니다.'}
            </div>
          </div>
        </div>
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
            <div
              className={styles.helperText}
              style={{ color: isSendSms ? 'green' : 'crimson' }}
            >
              {isSendSms ? smsMessage : '전화번호 입력 후 본인 인증 바랍니다.'}
            </div>
          </div>
        </div>
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
        <div className={styles.inputRow}>
          <label className={styles.label}>사업자 번호</label>
          <div className={styles.inputWithBtn}>
            <input
              className={styles.input}
              type="text"
              name="businessNum"
              value={formData.businessNum}
              onChange={handleChange}
              required
            />
            <button type="button" className={styles.actionBtn}>
              조회
            </button>
          </div>
        </div>

        <div className={styles.agreementWrapper}>
          <label>
            <input
              type="checkbox"
              name="agreement"
              checked={formData.agreement}
              onChange={handleChange}
            />
            <span style={{ marginLeft: '5px' }}>
              [필수] 개인 정보 수집 및 이용 동의
            </span>
          </label>
        </div>

        {/* 에러 메시지 표시 영역 추가 */}
        {err && <div style={{ color: 'crimson', fontSize: 13 }}>{err}</div>}

        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
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
