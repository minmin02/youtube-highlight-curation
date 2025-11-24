// YouTube Data API v3 유틸리티

// API 키: 환경 변수 또는 직접 설정
// 배포 시 Google Cloud Console에서 HTTP referrer 제한을 설정하세요
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || 'AIzaSyAOe0F23R-2Bo-FNow2cpVwEXmYX2zI4nw';
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * YouTube 영상 검색
 */
export const searchVideos = async (query, maxResults = 10) => {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API 키가 설정되지 않았습니다. .env 파일에 VITE_YOUTUBE_API_KEY를 추가하세요.');
  }

  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/search?` +
      `part=snippet&` +
      `q=${encodeURIComponent(query)}&` +
      `type=video&` +
      `maxResults=${maxResults}&` +
      `key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || '검색에 실패했습니다.');
    }

    const data = await response.json();
    return data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      publishedAt: item.snippet.publishedAt,
      description: item.snippet.description
    }));
  } catch (error) {
    console.error('YouTube 검색 오류:', error);
    throw error;
  }
};

/**
 * 인기 영상 가져오기
 */
export const getTrendingVideos = async (maxResults = 10, regionCode = 'KR') => {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API 키가 설정되지 않았습니다. .env 파일에 VITE_YOUTUBE_API_KEY를 추가하세요.');
  }

  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?` +
      `part=snippet,statistics,contentDetails&` +
      `chart=mostPopular&` +
      `regionCode=${regionCode}&` +
      `maxResults=${maxResults}&` +
      `key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || '인기 영상을 가져오는데 실패했습니다.');
    }

    const data = await response.json();
    return data.items.map(item => {
      // 재생 시간 포맷팅 (PT4M13S -> 4:13)
      const duration = item.contentDetails?.duration || '';
      const durationFormatted = formatDuration(duration);

      return {
        id: item.id,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        views: formatViews(item.statistics?.viewCount || '0'),
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        duration: durationFormatted,
        publishedAt: item.snippet.publishedAt
      };
    });
  } catch (error) {
    console.error('인기 영상 가져오기 오류:', error);
    throw error;
  }
};

/**
 * 영상 상세 정보 가져오기
 */
export const getVideoDetails = async (videoId) => {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API 키가 설정되지 않았습니다.');
  }

  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?` +
      `part=snippet,statistics,contentDetails&` +
      `id=${videoId}&` +
      `key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('영상 정보를 가져오는데 실패했습니다.');
    }

    const data = await response.json();
    if (data.items.length === 0) {
      throw new Error('영상을 찾을 수 없습니다.');
    }

    const item = data.items[0];
    return {
      id: item.id,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      views: formatViews(item.statistics?.viewCount || '0'),
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      duration: formatDuration(item.contentDetails?.duration || ''),
      description: item.snippet.description
    };
  } catch (error) {
    console.error('영상 상세 정보 가져오기 오류:', error);
    throw error;
  }
};

/**
 * ISO 8601 duration 포맷을 MM:SS로 변환
 * 예: PT4M13S -> 4:13
 */
function formatDuration(duration) {
  if (!duration) return '0:00';
  
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';

  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * 조회수 포맷팅
 * 예: 1234567 -> 1.2M views
 */
function formatViews(views) {
  const num = parseInt(views);
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B views`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M views`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K views`;
  }
  return `${num} views`;
}

