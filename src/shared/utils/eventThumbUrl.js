const BACKEND = 'http://localhost:8080';

export default function eventThumbUrl(thumbnail) {
  if (!thumbnail) return '/images/moheng.png';

  const t = String(thumbnail);

  // 이미 절대 URL이면 그대로
  if (t.startsWith('http')) return t;

  // 이미 /upload_files 로 시작하면 백엔드만 붙임
  if (t.startsWith('/upload_files/')) return `${BACKEND}${t}`;

  // DB에 파일명만 저장되는 케이스
  return `${BACKEND}/upload_files/event/${t}`;
}
