import { apiJson } from '../../../../app/http/request';

const BASE = '/api/admin/ai/contacts';

export async function fetchAdminAiContacts() {
  const res = await apiJson().get(BASE);
  return Array.isArray(res.data) ? res.data : [];
}

export async function answerAdminAiContact(id, payload) {
  const res = await apiJson().put(`${BASE}/${id}`, payload);
  return res.data || null;
}
