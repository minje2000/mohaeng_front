import { apiJson } from '../../app/http/request';

export async function fetchAdminAiContacts(limit = 100) {
  const { data } = await apiJson().get('/api/admin/ai/contacts', { params: { limit } });
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.items) ? data.items : [];
}

export async function updateAdminAiContact(itemId, payload) {
  const { data } = await apiJson().put(`/api/admin/ai/contacts/${itemId}`, payload);
  return data || null;
}

export async function answerAdminAiContact(itemId, payload) {
  return updateAdminAiContact(itemId, payload);
}

export async function deleteAdminAiContact(itemId) {
  try {
    const { data } = await apiJson().delete(`/api/admin/ai/contacts/${itemId}`);
    return data || null;
  } catch (error) {
    const status = error?.response?.status;
    if (status !== 404 && status !== 405) throw error;
    const { data } = await apiJson().post(`/api/admin/ai/contacts/${itemId}/delete`);
    return data || null;
  }
}

export async function fetchMyAiContacts(limit = 100) {
  const { data } = await apiJson().get('/api/ai/admin-contacts/me', { params: { limit } });
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.items) ? data.items : [];
}

export async function fetchAdminAiLogs(limit = 150) {
  const { data } = await apiJson().get('/api/admin/ai/logs', { params: { limit } });
  if (Array.isArray(data)) return { summary: {}, items: data };
  return {
    summary: data?.summary || {},
    items: Array.isArray(data?.items) ? data.items : [],
  };
}
