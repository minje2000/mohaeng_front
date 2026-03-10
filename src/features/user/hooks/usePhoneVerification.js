// src/features/user/hooks/usePhoneVerification.js
import { useState } from 'react';
import { userApi } from '../api/UserApi';

export const usePhoneVerification = () => {
  const [phone, setPhone] = useState('');
  const [verifiedCode, setVerifiedCode] = useState('');
  
  const [smsMessage, setSmsMessage] = useState(''); // 본인 인증 버튼 클릭 후 메시지
  const [isSendSms, setIsSendSms] = useState(false); // 인증 발송 여부
  const [verificationMessage, setVerificationMessage] = useState(''); // 인증 확인 버튼 클릭 후 메시지
  const [isVerified, setIsVerified] = useState(false); // 최종 인증 성공 여부

  // 전화번호 숫자만 입력 & 상태 초기화 로직
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // 숫자만 남기기
    setPhone(value);
    
    // 번호가 바뀌면 인증 상태 리셋
    setIsSendSms(false);
    setSmsMessage('');
    setVerificationMessage('');
    setIsVerified(false);
  };

  const handleCodeChange = (e) => {
    setVerifiedCode(e.target.value);
  };

  // 본인 인증 문자 발송
  const sendSms = async () => {
    if (!phone) {
      alert('전화번호를 입력해주세요.');
      return;
    }
    try {
      const res = await userApi.verifyByPhone(phone);
      setSmsMessage(res.data); 
      if(res.success == true) setIsSendSms(true);
    } catch (error) {
      setSmsMessage('문자 발송에 실패했습니다.');
      setIsSendSms(false);
    }
  };

  // 인증 번호 확인
  const verifyCode = async () => {
    if (!verifiedCode) {
      alert('인증번호를 입력해주세요.');
      return;
    }
    try {
      const res = await userApi.checkCode(phone, verifiedCode);
      setVerificationMessage(res.data);
      res.success == true ? setIsVerified(true) : setIsVerified(false); 
    } catch (error) {
      setVerificationMessage('인증 확인 중 오류가 발생했습니다.');
      setIsVerified(false);
    }
  };

  // 인증 상태 초기화
  const resetAuth = (initialPhone = '') => {
    setPhone(initialPhone);
    setVerifiedCode('');
    setSmsMessage('');
    setIsSendSms(false);
    setVerificationMessage('');
    setIsVerified(false);
  };

  return {
    phone,
    verifiedCode,
    smsMessage,
    isSendSms,
    verificationMessage,
    isVerified,
    handlePhoneChange,
    handleCodeChange,
    sendSms,
    verifyCode,
    resetAuth,
  };
};