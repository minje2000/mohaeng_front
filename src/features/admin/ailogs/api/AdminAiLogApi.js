import { apiJson } from '../../../../app/http/request';

const BASE = '/api/admin/ai/logs';

export async function fetchAdminAiLogs(limit = 200) {
  const res = await apiJson().get(BASE, { params: { limit } });
  return res.data || { summary: {}, items: [] };
}
