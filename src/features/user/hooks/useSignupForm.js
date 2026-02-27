// src/features/user/hooks/userSignupForm.js
import { useState, useMemo } from 'react';
import { userApi } from '../api/UserApi';

export const useSignupForm = (initialValues) => {
  const [formData, setFormData] = useState(initialValues);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(''); // 에러 상태 추가

  // 중복 확인 상태 (null: 확인전, true: 사용가능, false: 중복/사용불가)
  const [isIdAvailable, setIsIdAvailable] = useState(null);
  
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[^\s]{8,}$/;

  // 실시간 비밀번호 유효성 검사
  const isPasswordValid = useMemo(() => {
    return passwordRegex.test(formData.userPwd || '');
  }, [formData.userPwd]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // 이메일이 변경되면 중복 확인 상태 초기화
    if (name === 'email') {
      setIsIdAvailable(null);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // 중복 확인 로직 추가
  const handleIdCheck = async () => {
    if (!formData.email) {
      alert('이메일을 입력해주세요.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('올바른 이메일 형식이 아닙니다.');
      return;
    }

    try {
      const res = await userApi.checkId(formData.email);
      
      if (res.data === 'ok') {
        setIsIdAvailable(true);
      } else {
        setIsIdAvailable(false);
      }
    } catch (error) {
      console.error('중복 확인 실패:', error);
      alert('중복 확인 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async (e, userType, navigate) => {
    e.preventDefault();
    setErr('');

    // 이메일 중복 검사
    if (isIdAvailable !== true) {
      alert('이메일 중복 확인이 필요합니다.');
      return;
    }

    // 비밀번호 유효성 검사
    if (!isPasswordValid) {
      alert('비밀번호는 영문자와 숫자를 조합하여 8자리 이상이어야 합니다.');
      return;
    }

    if (!formData.agreement) {
      alert('개인 정보 수집 및 이용에 동의해야 합니다.');
      return;
    }

    setIsLoading(true);
    try {
      // API 전송 
      const userData = new FormData();
      for (const key in formData) {
        // 불필요한 agreement 값은 제외
        if (key !== 'agreement') {
          userData.append(key, formData[key]);
        }
      }
      // 회원 유형(PERSONAL/COMPANY) 추가
      userData.append('userType', userType);
      // 가입 유형 추가
      userData.append('signupType', 'BASIC');


      const res = await userApi.signup(userData);
      // console.log("res", res)
      if(res.success == true){
        alert('회원가입이 완료되었습니다!');
        navigate('/login', { replace: true });
      } 

    } catch (error) {
      const errorMsg = error?.response?.data?.message || error?.message || '회원가입 중 오류가 발생했습니다.';
      setErr(errorMsg);
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialValues);
    setErr('');
  };

  return { 
    formData, 
    handleChange, 
    handleIdCheck,
    handleSubmit, 
    handleReset, 
    isIdAvailable,
    isLoading, 
    isPasswordValid,
    err 
  };
};