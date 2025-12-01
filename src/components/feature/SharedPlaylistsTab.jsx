import { useState, useEffect } from 'react';
import useVideoStore from '../../stores/useVideoStore';
import { SHARE_STATUS, SHARE_STATUS_LABELS, MESSAGES } from '../../constants';

export const SharedPlaylistsTab = () => {
  const [sharedPlaylists, setSharedPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const { 
    getSharedPlaylists, 
    acceptSharedPlaylist, 
    declineSharedPlaylist
  } = useVideoStore();

  const loadSharedPlaylists = async () => {
    setLoading(true);
    try {
      const playlists = await getSharedPlaylists();
      setSharedPlaylists(playlists);
    } catch (error) {
      console.error('공유 플레이리스트 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSharedPlaylists();
  }, []);

  const handleAccept = async (sharedId) => {
    setActionLoading(sharedId);
    try {
      await acceptSharedPlaylist(sharedId);
      alert(MESSAGES.PLAYLIST.ACCEPT_SUCCESS);
      loadSharedPlaylists();
    } catch (error) {
      alert(error.message || MESSAGES.PLAYLIST.ACCEPT_ERROR);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (sharedId) => {
    if (!window.confirm(MESSAGES.PLAYLIST.DECLINE_CONFIRM)) return;

    setActionLoading(sharedId);
    try {
      await declineSharedPlaylist(sharedId);
      loadSharedPlaylists();
    } catch (error) {
      alert(error.message || MESSAGES.PLAYLIST.DECLINE_ERROR);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      [SHARE_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
      [SHARE_STATUS.ACCEPTED]: 'bg-green-100 text-green-800',
      [SHARE_STATUS.DECLINED]: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles[SHARE_STATUS.PENDING]}`}>
        {SHARE_STATUS_LABELS[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <i className="ri-loader-4-line text-4xl text-gray-400 animate-spin"></i>
        <p className="mt-2 text-gray-500">로딩 중...</p>
      </div>
    );
  }

  const pendingShares = sharedPlaylists.filter(p => p.status === SHARE_STATUS.PENDING);
  const acceptedShares = sharedPlaylists.filter(p => p.status === SHARE_STATUS.ACCEPTED);
  const declinedShares = sharedPlaylists.filter(p => p.status === SHARE_STATUS.DECLINED);

  return (
    <div className="space-y-6">
      {pendingShares.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <i className="ri-mail-unread-line text-yellow-600"></i>
            새로운 공유 요청
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
              {pendingShares.length}
            </span>
          </h4>
          
          <div className="space-y-3">
            {pendingShares.map((shared) => (
              <div
                key={shared.id}
                className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-bold text-gray-900 mb-1">
                      {shared.playlistName || shared.playlistData?.name}
                    </h5>
                    <p className="text-sm text-gray-600 mb-2">
                      <i className="ri-user-line mr-1"></i>
                      {shared.ownerEmail}님이 공유함
                    </p>
                    <p className="text-xs text-gray-500">
                      {shared.playlistData?.tags?.length || 0}개의 하이라이트 · {formatDate(shared.sharedAt)}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleAccept(shared.id)}
                      disabled={actionLoading === shared.id}
                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                    >
                      {actionLoading === shared.id ? (
                        <i className="ri-loader-4-line animate-spin"></i>
                      ) : (
                        <i className="ri-check-line"></i>
                      )}
                      수락
                    </button>
                    <button
                      onClick={() => handleDecline(shared.id)}
                      disabled={actionLoading === shared.id}
                      className="no-theme px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors flex items-center gap-1"
                    >
                      <i className="ri-close-line"></i>
                      거절
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {acceptedShares.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <i className="ri-check-double-line text-green-600"></i>
            수락한 플레이리스트
            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
              {acceptedShares.length}
            </span>
          </h4>
          
          <div className="space-y-3">
            {acceptedShares.map((shared) => (
              <div
                key={shared.id}
                className="p-4 bg-green-50 border border-green-200 rounded-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-bold text-gray-900 mb-1">
                      {shared.playlistName || shared.playlistData?.name}
                    </h5>
                    <p className="text-sm text-gray-600">
                      <i className="ri-user-line mr-1"></i>
                      {shared.ownerEmail}님이 공유함
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {shared.playlistData?.tags?.length || 0}개의 하이라이트 · {formatDate(shared.sharedAt)}
                    </p>
                  </div>
                  <StatusBadge status={shared.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {declinedShares.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <i className="ri-history-line text-gray-600"></i>
            거절한 공유
          </h4>
          
          <div className="space-y-2">
            {declinedShares.map((shared) => (
              <div
                key={shared.id}
                className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {shared.playlistName || shared.playlistData?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {shared.ownerEmail} · {formatDate(shared.sharedAt)}
                  </p>
                </div>
                <StatusBadge status={shared.status} />
              </div>
            ))}
          </div>
        </div>
      )}

              {sharedPlaylists.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <i className="ri-inbox-line text-5xl mb-3 text-gray-300"></i>
                  <p className="font-medium">{MESSAGES.SHARED.NO_SHARES}</p>
                  <p className="text-sm mt-1">{MESSAGES.SHARED.NO_SHARES_DESC}</p>
                </div>
              )}
    </div>
  );
};

export default SharedPlaylistsTab;
