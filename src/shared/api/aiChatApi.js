import { apiJson } from '../../app/http/request';

const SESSION_KEY = 'mohaeng_ai_session_id';

export function getAiSessionId() {
  let value = sessionStorage.getItem(SESSION_KEY);
  if (!value) {
    value = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, value);
  }
  return value;
}

export async function sendAiChat(payload) {
  const body = typeof payload === 'string' ? { message: payload } : { ...(payload || {}) };
  if (!body.message && body.question) body.message = body.question;
  if (!body.sessionId) body.sessionId = getAiSessionId();
  const { data } = await apiJson().post('/api/ai/chat', body);
  return data;
}
