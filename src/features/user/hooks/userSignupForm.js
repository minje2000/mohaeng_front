// src/features/user/hooks/userSignupForm.js
import { useState, useMemo } from 'react';
import { userApi } from '../api/UserApi';

export const useSignupForm = (initialValues) => {
  const [formData, setFormData] = useState(initialValues);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(''); // 에러 상태 추가
  
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  // 비밀번호 유효성 검사 함수 (영문, 숫자 포함 8자 이상)
  // const validatePassword = (password) => {
  //   return passwordRegex.test(password);
  // };

  // 실시간 비밀번호 유효성 검사
  const isPasswordValid = useMemo(() => {
    // const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(formData.userPwd || '');
  }, [formData.userPwd]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e, userType, navigate) => {
    e.preventDefault();
    setErr('');

    // 비밀번호 유효성 검사
    // const passwordToTest = formData.userPwd;
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
      console.log("res", res)
      if(res.success == true){
        alert('회원가입이 완료되었습니다!');
        navigate('/login', { replace: true });
      } 

      // if (navigate) {
      //   navigate('/login', { replace: true });
      // }
    } catch (error) {
      console.error('회원가입 실패:', error);
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
    handleSubmit, 
    handleReset, 
    isLoading, 
    isPasswordValid,
    err 
  };
};