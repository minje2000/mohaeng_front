import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Step1Selection from '../components/Step1Selection';
import Step2IndividualForm from '../components/Step2IndividualForm';
import Step3CorporateForm from '../components/Step3CorporateForm';
import styles from '../styles/SignUp.module.css';

export default function SignUp() {
  const [step, setStep] = useState(1);

  // 현재 step에 따라 제목 텍스트 결정
  const getTitleText = () => {
    switch (step) {
      case 2:
        return "개인 회원가입";
      case 3:
        return "업체 회원가입";
      default:
        return "회원가입";
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.headerSection}>
          {/* 로고 클릭 시 홈으로 이동 */}
          <Link to="/">
            <img src="/images/moheng.png" alt="모행" className={styles.logoImg} />
          </Link>
          <h1 className={styles.title}>{getTitleText()}</h1>
          <p style={{ color: '#666', fontSize: '18px' }}>
            모두의 모든 행사<br />
            모행에 오신 걸 환영합니다!<br />
            다양한 행사를 직접 만들고 경험 해보세요!
          </p>
        </div>

        {/* 단계별 화면 렌더링 */}
        {step === 1 && <Step1Selection onSelect={(type) => setStep(type === 'individual' ? 2 : 3)} />}
        {step === 2 && <Step2IndividualForm onBack={() => setStep(1)} />}
        {step === 3 && <Step3CorporateForm onBack={() => setStep(1)} />}
      </div>
    </main>
  );
}