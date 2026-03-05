// src/features/event/report/utils/reasonLabel.js
import { REPORT_REASONS } from "../components/ReportCategorySelect";

// value -> label 빠른 조회
const LABEL_MAP = Object.fromEntries(
  REPORT_REASONS.map((r) => [r.value, r.label])
);

//  관리자 상세/목록에서 공통으로 사용
export function reasonLabel(v) {
  if (!v) return "-";
  const key = String(v).trim().toUpperCase();

  // 과거/다른 코드 호환 (DB에 ABUSE 등이 남아있을 수 있음)
  if (key === "ABUSE") return "부적절한 내용";

  // 우리가 아는 코드면 한글 라벨, 아니면 원문 그대로(이미 한글이면 안전)
  return LABEL_MAP[key] ?? v;
}