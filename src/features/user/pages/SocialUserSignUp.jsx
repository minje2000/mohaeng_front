import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhoneVerification } from '../hooks/usePhoneVerification.js'; 
import styles from '../styles/SignUp.module.css'; 
import * as userApi from '../api/UserApi.js'; 
import { useAuth } from '../../../app/providers/AuthProvider';

const SocialCompleteForm = () => {
  const navigate = useNavigate();
  const { setTokens } = useAuth();
  const [socialInfo, setSocialInfo] = useState(null);

  const {
    phone,
    verifiedCode,
    smsMessage,
    isSendSms,
    verificationMessage,
    isVerified,
    handlePhoneChange,
    handleCodeChange,
    sendSms,
    verifyCode
  } = usePhoneVerification();

  useEffect(() => {
    const cookies = document.cookie.split(';');
    const socialCookie = cookies.find(cookie =>
      cookie.trim().startsWith('SOCIAL_INFO=')
    );

    if (socialCookie) {
      try {
        const encoded = socialCookie.split('=')[1];
        const binaryString = atob(encoded);
        const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));
        const decodedStr = new TextDecoder('utf-8').decode(bytes);
        const info = JSON.parse(decodedStr);
        setSocialInfo(info);
      } catch (e) {
        console.error('쿠키 파싱 오류', e);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isVerified){
      alert('본인 인증 확인이 필요합니다.');
      return;
    }

    try {
      const socialUserDto = {
        provider: socialInfo.provider,
        providerId: socialInfo.providerId,
        email: socialInfo.email,
        name: socialInfo.name,
        phone: phone
      };

      const token = await userApi.completeSocialSignup(socialUserDto);
      setTokens(token);

      alert('회원가입이 완료되었습니다!');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('회원가입 실패', error);
    }
  };

  if (!socialInfo) return <div className={styles.container}>로딩 중...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* 헤더 섹션 */}
        <div className={styles.headerSection}>
          <h2 className={styles.title}>구글 계정 연동 회원가입</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
            전화번호 입력 및 본인 인증 시 회원가입이 완료됩니다!
          </p>
        </div>

        {/* 폼 컨테이너 */}
        <form onSubmit={handleSubmit} className={styles.formContainer} style={{ gap: '12px' }}>
          
          {/* 이메일(ID)*/}
          <div className={styles.inputRow}>
            <label className={styles.label}>이메일(ID)</label>
            <div className={styles.inputGroup}>
              <input 
                className={styles.input} 
                type="email" 
                value={socialInfo.email} 
                readOnly 
                style={{ backgroundColor: '#f9fafb', color: '#6b7280' }}
              />
            </div>
          </div>

          {/* 이름 */}
          <div className={styles.inputRow}>
            <label className={styles.label}>이름</label>
            <div className={styles.inputGroup}>
              <input 
                className={styles.input} 
                type="text" 
                value={socialInfo.name} 
                readOnly 
                style={{ backgroundColor: '#f9fafb', color: '#6b7280' }}
              />
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
                  value={phone} 
                  onChange={handlePhoneChange} 
                  placeholder="-없이 숫자만 입력" 
                  maxLength="11" 
                  required 
                />
                <button type="button" className={styles.actionBtn} onClick={sendSms}>
                  인증 요청
                </button>
              </div>
              <div className={styles.helperText} style={{ color: isSendSms ? 'green' : 'crimson' }}>
                {smsMessage || '전화번호 입력 후 본인 인증 바랍니다.'}
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
                  value={verifiedCode} 
                  onChange={handleCodeChange} 
                  required 
                />
                <button type="button" className={styles.actionBtn} onClick={verifyCode}>
                  확인
                </button>
              </div>
              {verificationMessage && (
                <div className={styles.helperText} style={{ color: isVerified ? 'green' : 'crimson' }}>
                  {verificationMessage}
                </div>
              )}
            </div>
          </div>

          <button type="submit" className={styles.submitBtn}>
            회원가입
          </button>
        </form>

        <button className={styles.backBtn} onClick={() => navigate('/signup')}>
          뒤로가기
        </button>
      </div>
    </div>
  );
};

export default SocialCompleteForm;