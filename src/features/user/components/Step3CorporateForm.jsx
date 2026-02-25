import React from 'react';
import { useNavigate } from 'react-router-dom'; // navigate 추가
import { useSignupForm } from '../hooks/useSignupForm';
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
    phone: '',
    businessNum: '',
    agreement: false, // 누락된 초기값 추가
    signupType: 'BASIC',
  });

  return (
    <div className={styles.formContainer}>
      <form
        onSubmit={(e) => handleSubmit(e, 'COMPANY', navigate)} // navigate 전달
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
          <div className={styles.inputWithBtn}>
            <input
              className={styles.input}
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <button type="button" className={styles.actionBtn}>
              본인 인증
            </button>
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
