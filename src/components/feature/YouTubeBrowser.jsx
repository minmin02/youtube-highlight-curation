import { useState, useEffect } from 'react';
import { searchVideos, getTrendingVideos } from '../../utils/youtubeApi';

const YouTubeBrowser = ({ onVideoSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('trending'); // trending, search
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  // 인기 영상 로드
  useEffect(() => {
    const loadTrendingVideos = async () => {
      if (activeTab !== 'trending') return;
      
      setLoading(true);
      setError('');
      
      try {
        const trending = await getTrendingVideos(10, 'KR');
        setVideos(trending);
      } catch (err) {
        if (err.message.includes('API 키')) {
          setApiKeyMissing(true);
        } else {
          setError(err.message);
        }
        // API 키가 없으면 샘플 데이터 표시
        setVideos(getSampleVideos());
      } finally {
        setLoading(false);
      }
    };

    loadTrendingVideos();
  }, [activeTab]);

  // 샘플 데이터 (API 키가 없을 때 사용)
  const getSampleVideos = () => [
    {
      id: 'dQw4w9WgXcQ',
      title: 'Rick Astley - Never Gonna Give You Up (Official Video)',
      channel: 'RickAstleyVEVO',
      views: '1.4B views',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      duration: '3:33'
    },
    {
      id: 'jNQXAC9IVRw',
      title: 'Me at the zoo',
      channel: 'jawed',
      views: '245M views',
      thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/mqdefault.jpg',
      duration: '0:19'
    },
    {
      id: 'kJQP7kiw5Fk',
      title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
      channel: 'LuisFonsiVEVO',
      views: '8.2B views',
      thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg',
      duration: '4:42'
    },
    {
      id: '9bZkp7q19f0',
      title: 'PSY - GANGNAM STYLE (강남스타일) Official Music Video',
      channel: 'officialpsy',
      views: '5.1B views',
      thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg',
      duration: '4:13'
    },
    {
      id: 'OPf0YbXqDm0',
      title: 'Mark Ronson - Uptown Funk ft. Bruno Mars',
      channel: 'MarkRonsonVEVO',
      views: '5.3B views',
      thumbnail: 'https://img.youtube.com/vi/OPf0YbXqDm0/mqdefault.jpg',
      duration: '4:30'
    }
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setActiveTab('search');

    try {
      const results = await searchVideos(searchQuery, 10);
      // 검색 결과에 조회수와 재생 시간 정보 추가 (별도 API 호출 필요하지만 여기서는 기본값 사용)
      const videosWithDetails = results.map(video => ({
        ...video,
        views: '조회수 정보 없음',
        duration: '재생 시간 정보 없음'
      }));
      setVideos(videosWithDetails);
    } catch (err) {
      if (err.message.includes('API 키')) {
        setApiKeyMissing(true);
        setVideos(getSampleVideos().map(video => ({
          ...video,
          title: `${searchQuery} - ${video.title}`
        })));
      } else {
        setError(err.message);
        setVideos([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (videoId) => {
    if (onVideoSelect) {
      onVideoSelect(videoId);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-6 bg-red-600 rounded flex items-center justify-center">
            <i className="ri-play-fill text-white text-xs"></i>
          </div>
          <span className="text-lg font-semibold text-gray-900">YouTube</span>
        </div>
        <div className="text-xs text-gray-500">
          사이트 내 탐색
        </div>
      </div>

      {/* 검색 바 */}
      <div className="px-4 py-4 border-b border-gray-200 bg-white">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="YouTube에서 검색..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <i className="ri-loader-4-line text-gray-600 animate-spin"></i>
            ) : (
              <i className="ri-search-line text-gray-600"></i>
            )}
          </button>
        </form>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab('trending')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'trending'
              ? 'text-gray-900 border-b-2 border-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <i className="ri-fire-line mr-2"></i>
          인기
        </button>
        {activeTab === 'search' && (
          <button
            onClick={() => setActiveTab('trending')}
            className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            돌아가기
          </button>
        )}
      </div>

      {/* API 키 안내 */}
      {apiKeyMissing && (
        <div className="mx-4 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <i className="ri-information-line text-yellow-600 text-lg flex-shrink-0 mt-0.5"></i>
            <div className="text-sm">
              <p className="font-medium text-yellow-900 mb-1">YouTube API 키가 필요합니다</p>
              <p className="text-yellow-700">
                실제 데이터를 보려면 .env 파일에 <code className="bg-yellow-100 px-1 rounded">VITE_YOUTUBE_API_KEY</code>를 추가하세요.
                <br />
                <a 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-yellow-600 hover:text-yellow-800 underline"
                >
                  Google Cloud Console에서 API 키 발급받기
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <i className="ri-error-warning-line text-red-600"></i>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* 영상 목록 */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-4">
          {activeTab === 'search' && searchQuery && (
            <div className="mb-4 text-sm text-gray-600">
              "{searchQuery}" 검색 결과
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                onClick={() => handleVideoClick(video.id)}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
              >
                <div className="relative aspect-video bg-gray-900">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/320x180?text=No+Thumbnail';
                    }}
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
                    {video.duration}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <i className="ri-play-fill text-white text-2xl ml-1"></i>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                    {video.title}
                  </h4>
                  <p className="text-xs text-gray-600 mb-1">{video.channel}</p>
                  <p className="text-xs text-gray-500">{video.views}</p>
                </div>
              </div>
            ))}
          </div>

          {videos.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              <i className="ri-video-line text-4xl mb-3"></i>
              <p>영상을 찾을 수 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YouTubeBrowser;

