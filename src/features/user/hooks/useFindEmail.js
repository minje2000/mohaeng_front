// src/features/user/hooks/useFindEmail.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from '../api/UserApi';

export const useFindEmail = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
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

  // 제출 핸들러
  const handleSubmit = async (e, phone, isVerified) => {
    e.preventDefault();
    setIsSubmitted(true);

    const { name } = formData;
    
    // 유효성 검사
    if (!name || !phone) return;

    // 본인 인증 검사
    if (!isVerified){
      alert('본인 인증 확인이 필요합니다.');
      return;
    }

    try {
      const res = await userApi.searchId(name, phone);
      const data = res.data;
      // console.log(`data ${data}`)

      // data가 1개일 경우
      if (typeof data === "string") {
        alert(`가입하신 이메일은 ${data} 입니다.`);
      } else if (typeof data === "object" && data !== null) {
        // 여러 개일 경우
        const { googleEmails, normalEmails } = data;

        let message = "";

        if (googleEmails.length > 0) {
          message += `구글 계정 연동 가입 이메일 : ${googleEmails.join(", ")}\n`;
        }

        if (normalEmails.length > 0) {
          message += `일반 회원가입 이메일 : ${normalEmails.join(", ")}`;
        }

        alert(message);
      }
      navigate("/login");
    } catch (error) {
      // console.log(error)
      if (error.data) {
        alert(error.data || "회원 정보를 찾을 수 없습니다."); 
      } else {
        alert("서버 통신 중 오류가 발생했습니다.");
      }
    }
  };

  return {
    formData,
    isSubmitted,
    handleChange,
    handleSubmit,
  };
};