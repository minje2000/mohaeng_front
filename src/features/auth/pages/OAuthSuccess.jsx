import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider";

function decodeJwt(token) {
  try {
    const part = token.split('.')[1];
    const pad = part.length % 4;
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/')
      + (pad ? '='.repeat(4 - pad) : '');
    return JSON.parse(decodeURIComponent(
      atob(normalized).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    ));
  } catch {
    return {};
  }
}

export default function OAuthSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setTokens } = useAuth();

  useEffect(() => {
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken && refreshToken) {
      const payload = decodeJwt(accessToken);

      setTokens({
        accessToken,
        refreshToken,
        userId: payload.sub,
        role: payload.role,
        username: payload.username, 
      });
      navigate("/", { replace: true });
    }
  }, []);

  return <div>로그인 처리 중...</div>;
}