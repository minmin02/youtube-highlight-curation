import { Tag } from '../stores/useVideoStore';

export const extractVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const createShareableUrl = (videoId: string, tags: Tag[]): string => {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams();
  params.set('v', videoId);
  params.set('tags', JSON.stringify(tags));
  return `${baseUrl}/share?${params.toString()}`;
};

export const parseSharedUrl = (): { videoId: string; tags: Tag[] } | null => {
  const params = new URLSearchParams(window.location.search);
  const videoId = params.get('v');
  const tagsParam = params.get('tags');

  if (!videoId || !tagsParam) return null;

  try {
    const tags = JSON.parse(tagsParam);
    return { videoId, tags };
  } catch {
    return null;
  }
};