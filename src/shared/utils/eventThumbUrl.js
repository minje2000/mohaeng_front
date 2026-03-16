import { eventImageUrl } from './uploadFileUrl';

export default function eventThumbUrl(thumbnail) {
  return eventImageUrl(thumbnail, '/images/moheng.png');
}
