import { apiJson } from '../../app/http/request';

export async function fetchAdminAiContacts(limit = 100) {
  const { data } = await apiJson().get('/api/admin/ai/contacts', {
    params: { limit },
  });
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.items) ? data.items : [];
}

export async function fetchAdminAiLogs(limit = 150) {
  const { data } = await apiJson().get('/api/admin/ai/logs', {
    params: { limit },
  });
  if (Array.isArray(data)) {
    return { summary: {}, items: data };
  }
  return {
    summary: data?.summary || {},
    items: Array.isArray(data?.items) ? data.items : [],
  };
}
