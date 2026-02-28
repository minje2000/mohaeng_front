// src/features/user/pages/UserInfoMypage
import React from 'react';
import styles from '../styles/UserInfoMypage.module.css';
import { useUserInfo } from '../hooks/useUserInfo';
import { useNavigate } from 'react-router-dom';

export function UserInfoIndex() {
  const { userInfo, passwords, loading, isEditing, isPasswordValid, isPasswordMatch, isSaveDisabled, fileInputRef,
    handleInputChange, handlePwdChange, handleSave, toggleEditing, handleImageChange, handleEditPhotoClick  } = useUserInfo();
    
  const navigate = useNavigate();
  
  if (loading) return <div className={styles.loading}>로딩 중...</div>;

  const isPersonal = userInfo.userType === 'PERSONAL';
  const isCompany = userInfo.userType === 'COMPANY';
  const isBASIC = userInfo.signupType === 'BASIC';

  const IMG_URL = process.env.REACT_APP_API_BASE_URL + 'upload_files/photo';

  return (
    <main className={styles.content}>
      <h2 className={styles.title}>개인 정보 관리</h2>
      
      <div className={styles.profileBox}>
        {/* 프로필 이미지 영역 */}
        <div className={styles.profileWrapper}>
          <div className={styles.bigProfile}>
            {userInfo.profileImg ? (
              <img src={ userInfo.profileImg.startsWith('data:')  // 새로 업로드한 이미지인지
                        ? userInfo.profileImg // 새로 업로드한 미리보기 데이터
                        : `${IMG_URL}/${userInfo.profileImg}` // 서버에서 가져온 기존 파일명
                    } alt="Profile" />
            ) : (
              <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
            )}
          </div>
          {isEditing && (
            <>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
              <button 
                className={styles.editPhotoBtn} 
                onClick={handleEditPhotoClick}
                type="button"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                  <path d="M3 4V1h2v3h3v2H5v3H3V6H0V4h3zm3 6V7h3V4h7l1.83 2H21c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V10h3zm7 9c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-3.2-5c0 1.77 1.43 3.2 3.2 3.2s3.2-1.43 3.2-3.2-1.43-3.2-3.2-3.2-3.2 1.43-3.2 3.2z"/>
                </svg>
              </button>
            </>
          )}
        </div>

        {isPersonal && !isBASIC && (
          <p className={styles.noticeText}>* 구글 계정 연동 가입</p>
        )}

        <div className={styles.infoSection}>
          {/* 이메일 */}
          <div className={styles.infoRow}>
            <span className={styles.label}>이메일</span>
            <span className={styles.value}>{userInfo.email}</span>
          </div>
          
          {/* 이름 / 회사명 */}
          <div className={styles.infoRow}>
            <span className={styles.label}>{isCompany ? '회사명' : '이름'}</span>
            <span className={styles.value}>{userInfo.name}</span>
          </div>

          {/* 수정 모드일 때만 나타나는 비밀번호 필드 */}
          {isEditing && isBASIC && (
            <>
              <div className={styles.infoRow}>
                <span className={styles.label}>새 비밀번호</span>
                <div className={styles.inputGroup}>
                  <input 
                    className={styles.editInput} 
                    type="password" 
                    name="newPwd" 
                    value={passwords.newPwd} 
                    onChange={handlePwdChange} 
                    placeholder="새 비밀번호 입력" 
                  />
                  {passwords.newPwd && (
                    <div className={styles.helperText} style={{ color: isPasswordValid ? 'green' : 'crimson' }}>
                      {isPasswordValid ? '사용 가능한 비밀번호입니다.' : '영문자, 숫자 조합 8자리 이상이어야 합니다.'}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.label}>비밀번호 확인</span>
                <div className={styles.inputGroup}>
                  <input 
                    className={styles.editInput} 
                    type="password" 
                    name="confirmPwd" 
                    value={passwords.confirmPwd} 
                    onChange={handlePwdChange} 
                    placeholder="새 비밀번호 재입력" 
                  />
                  {passwords.confirmPwd && (
                    <div className={styles.helperText} style={{ color: isPasswordMatch ? 'green' : 'crimson' }}>
                      {isPasswordMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          {/* 전화번호 */}
          <div className={styles.infoRow}>
            <span className={styles.label}>전화번호</span>
            <div className={styles.inputWithBtn}>
              {isEditing ? (
                <>
                  <input className={styles.editInput} name="phone" value={userInfo.phone} onChange={handleInputChange} />
                  <button className={styles.certBtn}>본인 인증</button>
                </>
              ) : (
                <span className={styles.value}>{userInfo.phone}</span>
              )}
            </div>
          </div>

          {isCompany && (
            <div className={styles.infoRow}>
              <span className={styles.label}>사업자 번호</span>
              {isEditing ? (
                <input className={styles.editInput} name="businessNum" value={userInfo.businessNum} onChange={handleInputChange} />
              ) : (
                <span className={styles.value}>{userInfo.businessNum}</span>
              )}
            </div>
          )}
        </div>

        <div className={styles.buttons}>
          {isEditing ? (
            <>
              <button className={styles.primary} onClick={handleSave} disabled={isSaveDisabled}>저장하기</button>
              <button className={styles.secondary} onClick={toggleEditing}>취소</button>
            </>
          ) : (
            <>
              <button className={styles.primary} onClick={toggleEditing}>정보 수정</button>
              <button className={styles.secondary} onClick={() => navigate('/mypage/withdrawal')}>회원 탈퇴</button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
