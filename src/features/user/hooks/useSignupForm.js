// src/features/user/hooks/userSignupForm.js
import { useState, useMemo } from 'react';
import { userApi } from '../api/UserApi';
import { apiJson } from '../../../app/http/request';

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[^\s]{8,}$/;

export const useSignupForm = (initialValues) => {
  const [formData, setFormData] = useState(initialValues);
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState(''); // 에러 상태 추가

  // 중복 확인 상태 (null: 확인전, true: 사용가능, false: 중복/사용불가)
  const [isIdAvailable, setIsIdAvailable] = useState(null);

  // 사업자 인증 상태
  const [bizFile,        setBizFile]        = useState(null);
  const [bizVerified,    setBizVerified]    = useState(false);   // 인증 완료 여부
  const [bizVerifying,   setBizVerifying]   = useState(false);   // 인증 중
  const [bizMessage,     setBizMessage]     = useState('');      // 인증 결과 메시지
  const [bizSuccess,     setBizSuccess]     = useState(null);    // true/false/null
  const [bizNumber,      setBizNumber]      = useState('');      // 추출된 사업자번호

  // 실시간 비밀번호 유효성 검사
  const isPasswordValid = useMemo(() => {
    return PASSWORD_REGEX.test(formData.userPwd || '');
  }, [formData.userPwd]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    // 이메일이 변경되면 중복 확인 상태 초기화
    if (name === 'email') {
      setIsIdAvailable(null);
    }

    // 사업자 등록증
    if (type === 'file') {
      const file = files[0];

      setBizFile(file);
      // 파일 바꾸면 인증 초기화
      setBizVerified(false);
      setBizSuccess(null);
      setBizMessage('');
      setBizNumber('');

      setFormData((prev) => ({
        ...prev,
        [name]: file,
        name: '',           
        businessNum: ''
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // 중복 확인 로직
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

  // 인증하기 클릭
  const handleVerifyBiz = async () => {
    if (!bizFile) {
      alert('사업자등록증 파일을 먼저 업로드해주세요.');
      return;
    }
    setBizVerifying(true);
    setBizMessage('');
    setBizSuccess(null);

    try {
      const form = new FormData();
      form.append('businessFile', bizFile);

      const res = await apiJson().post('/api/user/verifyBiz', form);
      const data = res.data;

      if (data.success) {
        const businessNum = data.data?.businessNum || '';
        const companyName = data.data?.companyName || '';

        setBizNumber(businessNum);

        // 회사명 자동 입력
        setFormData((prev) => ({
          ...prev,
          name: companyName,
          businessNum: businessNum,
        }));

        setBizVerified(true);
        setBizSuccess(true);
        setBizMessage(
          `인증되었습니다. (사업자번호: ${businessNum})`
        );
      } else {
        setBizVerified(false);
        setBizSuccess(false);
        setBizMessage(data.message);
      }

    } catch (e) {
      setBizVerified(false);
      setBizSuccess(false);

      const message = e.response?.data?.message;
      const businessNum = e.response?.data?.data?.businessNum;

      if (e.response?.status === 401 && businessNum) {
        setBizMessage(`${message} (사업자번호: ${businessNum})`);
      } else if (message) {
        setBizMessage(message);
      } else {
        setBizMessage("서버 오류가 발생했습니다.");
      }
    } finally {
      setBizVerifying(false);
    }
  };

  const handleSubmit = async (e, userType, navigate, phone, isVerified) => {
    e.preventDefault();
    setErr('');

    // 사업자 인증 여부 체크
    if (userType === 'COMPANY' && !bizVerified) {
      alert('사업자 등록증을 업로드하여 인증해야 합니다.');
      return;
    }

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

    // 본인 인증 검사
    if (!isVerified){
      alert('본인 인증 확인이 필요합니다.');
      return;
    }

    if (!formData.agreement) {
      alert('개인 정보 수집 및 이용에 동의해야 합니다.');
      return;
    }

    setIsLoading(true);
    try {
      const userData = new FormData();
      for (const key in formData) {
        if (key !== 'agreement') {
          userData.append(key, formData[key]);
        }
      }
      userData.append('phone', phone);
      userData.append('userType', userType);
      userData.append('signupType', 'BASIC');

      const res = await userApi.signup(userData);

      if(res.success === true){
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
    err,

    // 사업자 관련 반환
    bizFile,
    bizVerified,
    bizVerifying,
    bizMessage,
    bizSuccess,
    bizNumber,
    handleVerifyBiz
  };
};