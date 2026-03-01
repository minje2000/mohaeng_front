import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../api/UserApi";

export const useFindPwd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsSubmitted(false);
  };

  // 제출 핸들러
  const handleSubmit = async (e, phone, isVerified) => {
    e.preventDefault();
    setIsSubmitted(true);

    const { email } = formData;
    if (!email || !phone) return;

    // 본인 인증 검사
    if (!isVerified){
      alert('본인 인증 확인이 필요합니다.');
      return;
    }

    setIsLoading(true);

    try {
      // API 호출
      const res = await userApi.renewPwd(email, phone); 
      
      alert(res.message);
      navigate("/login");
    } catch (error) {
      if (error.message) {
        alert(error.data);
      } else {
        alert("일치하는 회원 정보가 없거나 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    isSubmitted,
    handleChange,
    handleSubmit,
  };
};