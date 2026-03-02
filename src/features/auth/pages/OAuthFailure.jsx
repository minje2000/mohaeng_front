import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(";").shift().replace(/\+/g, " "));
  }
}

export default function OAuthFailure() {
  const navigate = useNavigate();

  useEffect(() => {
    const message = getCookie("OAUTH_ERROR");

    if (message) {
      alert(message);

      // 쿠키 삭제
      document.cookie = "OAUTH_ERROR=; path=/; max-age=0";
    }

    navigate("/login", { replace: true });
  }, []);

  return null;
}