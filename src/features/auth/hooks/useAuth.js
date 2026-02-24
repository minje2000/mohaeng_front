// src/features/auth/hooks/useAuth.js
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeAuthEvent } from '../../../app/http/authEvents';
import { tokenStore } from '../../../app/http/tokenStore';

export function useAuth() {
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);

  // tokenStore는 외부 저장소라서, 이벤트 기반으로 렌더 트리거를 줍니다.
  const snapshot = useMemo(() => {
    const accessToken = tokenStore.getAccess();
    const refreshToken = tokenStore.getRefresh();
    const userId = tokenStore.getUserId();
    const role = tokenStore.getRole();

    return {
      accessToken,
      refreshToken,
      userId,
      role,
      isAuthenticated: Boolean(accessToken),
      isAdmin: role === 'ROLE_ADMIN' || role === 'admin' || role === 'ADMIN',
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  useEffect(() => {
    // emitLogout()가 호출되면 여기로 들어옴
    const unsubscribe = subscribeAuthEvent(() => {
      // tokenStore.clear()는 interceptors에서 이미 수행했을 수 있음
      setVersion((v) => v + 1);
      navigate('/login', { replace: true });
    });

    return unsubscribe;
  }, [navigate]);

  return snapshot;
}
