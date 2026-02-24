import { useNavigate } from "react-router-dom";

export default function JoinTermsPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-[100svh] bg-white px-6 pt-14 pb-16">
      <div className="mx-auto w-full max-w-[420px]">
        {/* 상단: 로고 + 타이틀 */}
        <div className="flex items-center gap-3 mb-6">
          <img src="/images/moheng.png" alt="모행" width={46} height={20} />
          <h1 className="text-lg font-semibold text-gray-900">
            개인 정보 수집 및 이용 동의
          </h1>
        </div>

        {/* 본문 */}
        <div className="text-[13px] leading-6 text-gray-900 whitespace-pre-line">
          {`[수집/이용 목적]
• 회원가입 및 본인 확인
• 행사 참가 신청 및 참가자 관리
• 행사 관련 안내 및 서비스 이용 안내, 사용자 상담 진행
• 고객 문의 및 민원 처리
• 서비스 이용 통계 및 개선

[수집하는 개인정보 항목]
• 이메일, 비밀번호, 이름, 전화번호

[개인정보 보유 및 이용 기간]
• 회원 탈퇴 시까지 보유 및 이용
• 단, 행사 참가 이력 및 정산·부정행위 처리 등 필요 시 관련 법령에 따라 일정 기간 보관
  - 계약 또는 청약철회 기록: 5년
  - 소비자 불만 또는 분쟁 처리 기록: 3년

[동의 거부 권리 및 불이익 안내]
• 이용자는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다.
• 필수 항목에 대한 동의를 거부할 경우 회원가입 및 행사 참여가 제한될 수 있습니다.`}
        </div>

        {/* 하단 버튼 */}
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-11 px-6 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50"
          >
            뒤로가기
          </button>
        </div>
      </div>
    </main>
  );
}
