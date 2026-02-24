// src/features/user/hooks/useSignupForm.js
import { useState } from 'react';
import { submitSignupData } from '../api/UserApi';

export const useSignupForm = (initialValues) => {
  const [formData, setFormData] = useState(initialValues);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e, userType) => {
    e.preventDefault();
    if (!formData.agreement) {
      alert('개인 정보 수집 및 이용에 동의해야 합니다.');
      return;
    }

    setIsLoading(true);
    try {
      // API 전송 (회원 유형 포함)
      await submitSignupData({ ...formData, userType });
      alert('회원가입이 완료되었습니다!');
      // TODO: 가입 완료 후 로그인 페이지나 메인 페이지로 이동 (useNavigate 활용)?????
    } catch (error) {
      alert('회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return { formData, handleChange, handleSubmit, isLoading };
};