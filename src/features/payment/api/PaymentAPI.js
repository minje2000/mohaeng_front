// src/features/payment/api/PaymentAPI.js
import { apiJson } from '../../../app/http/request';

// 1. 결제 준비 - orderId 발급
// ✅ 새 플로우: pctBoothId/pctId 불필요 (참여 레코드가 아직 없음)
export const preparePayment = async ({ eventId, amount, orderName }) => {
    const response = await apiJson().post('/api/payment/prepare', {
        eventId,
        amount,
        orderName,
    });
    return response.data;
};

// 2. 결제 승인 - 토스 콜백 후 백엔드에 최종 승인 요청
export const confirmPayment = async ({ paymentKey, orderId, amount }) => {
    const response = await apiJson().post('/api/payment/confirm', {
        paymentKey,
        orderId,
        amount,
    });
    return response.data;
};
