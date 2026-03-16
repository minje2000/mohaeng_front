import { getS3BaseUrl } from '../../app/config/env';

const S3_BASE = getS3BaseUrl();

const DIR_ALIASES = {
  event: 'event',
  hbooth: 'host-booth',
  'host-booth': 'host-booth',
  pbooth: 'participant-booth',
  'participant-booth': 'participant-booth',
  profile: 'photo',
  photo: 'photo',
};

function canonicalDir(dir) {
  return DIR_ALIASES[String(dir || '').trim()] || String(dir || '').trim();
}

export function buildUploadFileUrl(value, dir, placeholder = null) {
  if (!value) return placeholder;

  const raw = String(value).trim();
  if (!raw) return placeholder;

  if (
    raw.startsWith('http://') ||
    raw.startsWith('https://') ||
    raw.startsWith('data:') ||
    raw.startsWith('blob:')
  ) {
    return raw;
  }

  let normalized = raw.replace(/\\/g, '/').replace(/^\/+/, '');

  if (normalized.startsWith('upload_files/')) {
    normalized = normalized.substring('upload_files/'.length);
  }

  const firstSlash = normalized.indexOf('/');
  if (firstSlash > 0) {
    const firstSegment = canonicalDir(normalized.slice(0, firstSlash));
    const remainder = normalized.slice(firstSlash + 1);
    if (firstSegment && remainder) {
      return `${S3_BASE}/${firstSegment}/${remainder}`;
    }
  }

  const targetDir = canonicalDir(dir);
  if (!targetDir) return `${S3_BASE}/${normalized}`;
  return `${S3_BASE}/${targetDir}/${normalized}`;
}

export const eventImageUrl = (value, placeholder = '/images/moheng.png') =>
  buildUploadFileUrl(value, 'event', placeholder);

export const photoImageUrl = (value, placeholder = null) =>
  buildUploadFileUrl(value, 'photo', placeholder);

export const hostBoothFileUrl = (value, placeholder = null) =>
  buildUploadFileUrl(value, 'host-booth', placeholder);

export const participantBoothFileUrl = (value, placeholder = null) =>
  buildUploadFileUrl(value, 'participant-booth', placeholder);
