// URL 처리 유틸리티 함수들
import { Tag } from '../stores/useVideoStore';

// YouTube URL에서 비디오 ID를 추출하는 함수
export const extractVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// 초 단위 시간을 HH:MM:SS 또는 MM:SS 형식으로 변환
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// 비디오 ID와 태그 정보로 공유 가능한 URL 생성
export const createShareableUrl = (videoId: string, tags: Tag[]): string => {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams();
  params.set('v', videoId);
  params.set('tags', JSON.stringify(tags));
  return `${baseUrl}/share?${params.toString()}`;
};

// 공유된 URL에서 비디오 ID와 태그 정보를 파싱
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