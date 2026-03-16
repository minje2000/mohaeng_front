import { apiJson } from '../../../../app/http/request';

const BASE = '/api/admin/ai/faqs';

export async function fetchAdminAiFaqs() {
  const res = await apiJson().get(BASE);
  return Array.isArray(res.data) ? res.data : [];
}

export async function saveAdminAiFaqs(items) {
  const res = await apiJson().put(BASE, items);
  return Array.isArray(res.data) ? res.data : [];
}
