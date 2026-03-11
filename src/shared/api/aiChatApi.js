import { apiJson } from '../../app/http/request';

function getSessionId() {
  const key = 'mohaeng_ai_session_id';
  let value = sessionStorage.getItem(key);
  if (!value) {
    value = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(key, value);
  }
  return value;
}

export async function sendAiChat(message) {
  const { data } = await apiJson().post('/api/ai/chat', {
    message,
    sessionId: getSessionId(),
  });
  return data;
}
