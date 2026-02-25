// src/features/user/hooks/useFindEmail.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from '../api/UserApi';

export const useFindEmail = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsSubmitted(false); // 입력 시 에러 메시지 초기화
  };

  // 본인 인증 버튼 핸들러 (추후 기능 구현)
  const handleVerify = () => {
    alert("본인 인증 절차를 시작합니다.");
  };

  // 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    const { name, phone } = formData;
    
    // 유효성 검사
    if (!name || !phone) return;

    try {
    const res = await userApi.searchId(name, phone);
    
    alert(`가입하신 이메일은 ${res.data} 입니다.`);
    navigate("/login");

    } catch (error) {
      if (error.message) {
        alert(error.data); 
      } else {
        alert("서버 통신 중 오류가 발생했습니다.");
      }
      // console.error("Error details:", error);
    }
  };

  return {
    formData,
    isSubmitted,
    handleChange,
    handleVerify,
    handleSubmit,
  };
};