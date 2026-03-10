// src/features/user/hooks/useUserInfo.js
import { useState, useEffect, useMemo, useRef } from 'react';
import { getProfile, updateProfile } from '../api/UserApi';
import { usePhoneVerification } from '../../user/hooks/usePhoneVerification';

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[^\s]{8,}$/;

export function useUserInfo() {
  const [initialInfo, setInitialInfo] = useState({}); // 초기값 저장 (비교용)
  const [userInfo, setUserInfo] = useState({
    email: '', name: '', userPwd: '', phone: '', businessNum: '',
    userType: '', signupType: '', profileImg: ''
  });

  const phoneAuth = usePhoneVerification();

  const [selectedFile, setSelectedFile] = useState(null); // 새 파일 객체 (newPhoto)
  const [deletePhoto, setDeletePhoto] = useState(false); // 사진 삭제 여부
  const [passwords, setPasswords] = useState({ newPwd: '', confirmPwd: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);    // 파일 input 태그에 접근하기 위한 변수

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setUserInfo(data);
      setInitialInfo(data); // 로드 시 초기 상태 저장
      phoneAuth.handlePhoneChange({ target: { value: data.phone || '', name: 'phone' } });
      // phoneAuth.setPhone(data.phone);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUserInfo(); }, []);

  const isBASIC = userInfo.signupType === 'BASIC';

  // 이미지 선택 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 기존 사진이 존재할 경우
      if (userInfo.profileImg) {
        setDeletePhoto(true);
      }
      // 새 파일 상태 저장
      setSelectedFile(file);
      // 브라우저 미리보기를 위해 URL 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserInfo(prev => ({ ...prev, profileImg: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 카메라 아이콘 클릭 시 input 실행
  const handleEditPhotoClick = () => {
    fileInputRef.current?.click();
  };

  // 기존 사진 삭제
  const handleDeletePhoto = () => {
    setUserInfo(prev => ({ ...prev, profileImg: '' })); // 미리보기 지우기
    setSelectedFile(null); // 전송할 파일 지우기
    setDeletePhoto(true);
  };

  // 비밀번호 유효성 검사
  const isPasswordValid = useMemo(() => {
    if (!isBASIC) return true; // 소셜 로그인은 체크 불필요
    return PASSWORD_REGEX.test(passwords.newPwd || '');
  }, [passwords.newPwd, isBASIC]);

  // 비밀번호 일치 검사
  const isPasswordMatch = useMemo(() => {
    if (!isBASIC) return true; // 소셜 로그인은 체크 불필요
    if (!passwords.newPwd && !passwords.confirmPwd) return false;
    return passwords.newPwd === passwords.confirmPwd;
  }, [passwords.newPwd, passwords.confirmPwd, isBASIC]);

  // 저장 버튼 비활성화
  const isSaveDisabled = useMemo(() => {
    // 전화번호 변경 유무 확인
    const isPhoneChanged = initialInfo.phone !== phoneAuth.phone;
    
    // 전화번호 변경 후 본인 인증 여부 확인
    if (isPhoneChanged && !phoneAuth.isVerified) return true;

    // 항목별 변경 여부 체크
    const isPasswordChanged = isBASIC && (passwords.newPwd !== '' || passwords.confirmPwd !== '');
    const isPhotoChanged = !!selectedFile || deletePhoto; // 새 파일이 있거나, 기존 사진 삭제를 눌렀을 때
    
    // 전체 변경 여부 합산 (셋 중 하나라도 true면 변경)
    const hasAnyChanged = isPhoneChanged || isPasswordChanged || isPhotoChanged;

    // 일반 로그인(BASIC)인 경우 비밀번호 유효성 추가 검사
    if (isPasswordChanged) {
      // 비밀번호를 입력 중이라면 유효성과 일치 여부까지 확인
      return !(isPasswordValid && isPasswordMatch);
  }

    return !hasAnyChanged;
  }, [initialInfo.phone, phoneAuth.phone, phoneAuth.isVerified, isBASIC, passwords, isPasswordValid, isPasswordMatch, selectedFile, deletePhoto]);

  const handlePwdChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // 비밀번호 검증
    if (isBASIC && (passwords.newPwd || passwords.confirmPwd)) {
      if (!isPasswordValid) return alert("비밀번호 형식을 확인해주세요.");
      if (!isPasswordMatch) return alert("비밀번호가 일치하지 않습니다.");
    }

    try {
      setLoading(true);
      const finalInfo = { 
        ...userInfo, 
        phone: phoneAuth.phone,
        userPwd: isBASIC ? passwords.confirmPwd : null 
      };
      await updateProfile(finalInfo, deletePhoto, selectedFile);
      alert('정보가 수정되었습니다.');
      // setInitialInfo(finalInfo); // 초기값 동기화
      await fetchUserInfo();

      setIsEditing(false);
      setSelectedFile(null);
      setDeletePhoto(false);
      setPasswords({ newPwd: '', confirmPwd: '' });
      phoneAuth.resetAuth(phoneAuth.phone);
    } catch (error) {
      alert("수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const toggleEditing = () => {
    if (isEditing) {
      setUserInfo(initialInfo); // 취소 시 초기 데이터로 복구
      setSelectedFile(null);
      setDeletePhoto(false);
      setPasswords({ newPwd: '', confirmPwd: '' });
      phoneAuth.resetAuth(initialInfo.phone);
    }
    setIsEditing(!isEditing);
  };

  return { 
    userInfo, passwords, loading, isEditing, isPasswordValid, isPasswordMatch, isSaveDisabled, 
    fileInputRef, handleImageChange, handleEditPhotoClick, handleDeletePhoto,
    handlePwdChange, handleSave, setIsEditing, toggleEditing, phoneAuth
  };
}