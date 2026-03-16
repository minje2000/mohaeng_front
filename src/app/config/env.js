// src/app/config/env.js

function isLocalhostHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export function getApiBaseUrl() {
  const cra =
    typeof process !== 'undefined'
      ? process.env?.REACT_APP_API_BASE_URL
      : undefined;

  const value = (cra || '').replace(/\/$/, '');

  if (!value) return '';

  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    const configuredIsLocal = /(^|\/\/)localhost(?::\d+)?$|(^|\/\/)127\.0\.0\.1(?::\d+)?$/i.test(value);

    if (configuredIsLocal && !isLocalhostHost(currentHost)) {
      return '';
    }
  }

  return value;
}

export function getS3BaseUrl() {
  const cra =
    typeof process !== 'undefined'
      ? process.env?.REACT_APP_S3_BASE_URL
      : undefined;

  return (cra || 'https://mohaeng-files.s3.ap-northeast-2.amazonaws.com').replace(/\/$/, '');
}
