// src/features/user/pages/UserInfoMypage
import React from 'react';
import styles from '../styles/UserInfoMypage.module.css';
import { useUserInfo } from '../hooks/useUserInfo';
import { useNavigate } from 'react-router-dom';
import { photoImageUrl } from '../../../shared/utils/uploadFileUrl';

export function UserInfoIndex() {
  const { userInfo, passwords, loading, isEditing, isPasswordValid, isPasswordMatch, isSaveDisabled, fileInputRef,
    handlePwdChange, handleSave, toggleEditing, handleImageChange, handleEditPhotoClick, handleDeletePhoto, phoneAuth  } = useUserInfo();
    
  const navigate = useNavigate();
  
  if (loading) return <div className={styles.loading}>로딩 중...</div>;

  const isPersonal = userInfo.userType === 'PERSONAL';
  const isCompany = userInfo.userType === 'COMPANY';
  const isBASIC = userInfo.signupType === 'BASIC';


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
                        : photoImageUrl(userInfo.profileImg) // 서버에서 가져온 기존 파일명
                    } alt="Profile" />
            ) : (
              <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
            )}
          </div>
          {isEditing && (
            <div className={styles.editButtons}>
              {/* 사진 수정(카메라) 버튼 */}
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
              <button className={styles.editPhotoBtn} onClick={handleEditPhotoClick} type="button">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M3 4V1h2v3h3v2H5v3H3V6H0V4h3zm3 6V7h3V4h7l1.83 2H21c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V10h3z"/></svg>
              </button>

              {/* 사진 삭제(X) 버튼 - 사진이 있을 때만 노출 */}
              {userInfo.profileImg && (
                <button className={styles.deletePhotoBtn} onClick={handleDeletePhoto} type="button">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              )}
            </div>
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

          {/* 사업자 번호 */}
          {isCompany && (
            <div className={styles.infoRow}>
              <span className={styles.label}>사업자 번호</span>
              <span className={styles.value}>{userInfo.businessNum}</span>
            </div>
          )}

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
          
          {/* 전화번호 필드 */}
          <div className={styles.infoRow}>
            <span className={styles.label}>전화번호</span>
            <div className={styles.inputGroup}>
              <div className={styles.inputWithBtn}>
                {isEditing ? (
                  <>
                    <input 
                      className={styles.editInput} 
                      name="phone" 
                      value={phoneAuth.phone} 
                      onChange={phoneAuth.handlePhoneChange} 
                      maxLength={11}
                    />
                    <button 
                      type="button" 
                      className={styles.certBtn} 
                      onClick={phoneAuth.sendSms}
                      disabled={phoneAuth.isVerified}
                    >
                      {phoneAuth.isVerified ? '인증 완료' : '본인 인증'}
                    </button>
                  </>
                ) : (
                  <span className={styles.value}>{userInfo.phone}</span>
                )}
              </div>
              {/* 문자 발송 안내 메시지 */}
              {isEditing && phoneAuth.isSendSms && (
                <div className={styles.helperText} style={{ color: 'green' }}>
                  {phoneAuth.smsMessage}
                </div>
              )}
            </div>
          </div>

          {/* 본인 인증 버튼 클릭 후 인증번호 입력란 노출 */}
          {isEditing && phoneAuth.isSendSms && (
            <div className={styles.infoRow}>
              <span className={styles.label}>인증번호</span>
              <div className={styles.inputGroup}>
                <div className={styles.inputWithBtn}>
                  <input 
                    className={styles.editInput} 
                    placeholder="인증번호 입력" 
                    value={phoneAuth.verifiedCode}
                    onChange={phoneAuth.handleCodeChange}
                    disabled={phoneAuth.isVerified}
                  />
                  <button 
                    type="button" 
                    className={styles.certBtn} 
                    onClick={phoneAuth.verifyCode}
                    disabled={phoneAuth.isVerified}
                  >
                    확인
                  </button>
                </div>
                {/* 인증 결과 메시지 */}
                {phoneAuth.verificationMessage && (
                  <div className={styles.helperText} style={{ color: phoneAuth.isVerified ? 'green' : 'crimson' }}>
                    {phoneAuth.verificationMessage}
                  </div>
                )}
              </div>
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
