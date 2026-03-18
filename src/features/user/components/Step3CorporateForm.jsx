import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignupForm } from '../hooks/useSignupForm';
import { usePhoneVerification } from '../hooks/usePhoneVerification';
import { useModal } from '../hooks/usePerInfoTermsModal';
import SignUpTerms from '../pages/SignUpTerms';
import styles from '../styles/SignUp.module.css';
import { apiJson } from '../../../app/http/request';

const Step3CorporateForm = ({ onBack }) => {
  const navigate = useNavigate();
  const { isOpen, openModal, closeModal } = useModal();

  const {
    formData,
    handleChange,
    handleIdCheck,
    handleSubmit,
    isIdAvailable,
    isLoading,
    isPasswordValid,
    err,

    bizFile,
    bizVerified,
    bizVerifying,
    bizMessage,
    bizSuccess,
    handleVerifyBiz
  } = useSignupForm({
    email: '',
    userPwd: '',
    name: '',
    businessFile: null,
    businessNum: '',
    agreement: false,
  });

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
                onChange={handleChange}
                style={{ minWidth: 0, flex: 1 }}
              />
              <button
                type="button"
                className={styles.actionBtn}
                onClick={handleVerifyBiz}
                disabled={bizVerifying || !bizFile}
              >
                {bizVerifying ? '인증 중...' : bizVerified ? '인증 완료' : '인증하기'}
              </button>
            </div>

            {/* 인증 결과 메시지 */}
            {bizMessage && (
              <div
                className={styles.helperText}
                style={{ color: bizSuccess ? 'green' : 'crimson' }}
              >
                {bizMessage}
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

        {/* 가입 버튼 */}
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
