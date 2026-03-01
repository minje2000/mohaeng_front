import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignupForm } from '../hooks/useSignupForm';
import { usePhoneVerification } from '../hooks/usePhoneVerification';
import styles from '../styles/SignUp.module.css';

const Step2IndividualForm = ({ onBack }) => {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

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
      {/* 커스텀 구글 버튼 */}
      <button
        className={styles.googleBtn}
        type="button"
        onClick={handleGoogleLogin}
      >
        <svg className={styles.googleIcon} viewBox="0 0 48 48">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          ></path>
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          ></path>
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          ></path>
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          ></path>
        </svg>
        <span className={styles.googleText}>구글 계정으로 간편 가입</span>
      </button>

      <div className={styles.dividerLine}>
        <span>또는</span>
      </div>

      <form
        onSubmit={(e) => handleSubmit(e, 'PERSONAL', navigate, phone, isVerified)} 
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
          <label className={styles.label}>이름</label>
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

export default Step2IndividualForm;
