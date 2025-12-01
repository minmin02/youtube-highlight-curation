import { useState, useCallback } from 'react';
import useVideoStore from '../../stores/useVideoStore';
import usePlaylistPlayer from '../../hooks/usePlaylistPlayer';
import { SharePlaylistModal } from './SharePlaylistModal';
import { SharedPlaylistsTab } from './SharedPlaylistsTab';
import { RatingStars } from './RatingStars';
import { LinkShareModal } from './LinkShareModal';
import { AddVideoForm } from './AddVideoForm';
import { CreatePlaylistForm } from './CreatePlaylistForm';
import { EditPlaylistForm } from './EditPlaylistForm';
import { CurrentPlaylistView } from './CurrentPlaylistView';
import { PlaylistItem } from './PlaylistItem';
import { PlaylistList } from './PlaylistList';
import { SORT_OPTIONS, TABS, MESSAGES } from '../../constants';

const PlaylistManager = () => {
  const {
    tags,
    playlists,
    currentPlaylist,
    createPlaylist,
    setCurrentPlaylist,
    updatePlaylist,
    updatePlaylistRating,
    deletePlaylist,
    renamePlaylist,
    setVideoId
  } = useVideoStore();

  const {
    startPlaylist,
    stopPlaylist,
    jumpToPlaylistItem,
    isPlaying,
    currentIndex
  } = usePlaylistPlayer();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [newPlaylistRating, setNewPlaylistRating] = useState(0);
  const [showAddVideoForm, setShowAddVideoForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.RATING);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedPlaylistForShare, setSelectedPlaylistForShare] = useState(null);
  const [currentTab, setCurrentTab] = useState(TABS.MY_PLAYLISTS);
  
  const handleShareClick = useCallback((playlist) => {
    setSelectedPlaylistForShare(playlist);
    setShareModalOpen(true);
  }, []);

  const handleCreatePlaylist = () => {
    if (!playlistName.trim() || selectedTags.length === 0) {
      alert(MESSAGES.PLAYLIST.CREATE_ERROR);
      return;
    }

    const selectedTagObjects = tags.filter(tag => selectedTags.includes(tag.id));
    const playlist = createPlaylist(playlistName.trim(), selectedTagObjects, newPlaylistRating);

    setPlaylistName('');
    setSelectedTags([]);
    setNewPlaylistRating(0);
    setShowCreateForm(false);
    setCurrentPlaylist(playlist);
  };

  const handleTagSelection = useCallback((tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  }, []);


  const handlePlaylistItemClick = useCallback((index) => {
    jumpToPlaylistItem(index);
  }, [jumpToPlaylistItem]);

  const handleEditPlaylistTag = useCallback((tagIndex) => {
    if (!currentPlaylist) return;

    const tag = currentPlaylist.tags[tagIndex];
    const newTitle = prompt('태그 제목을 수정하세요:', tag.title);

    if (newTitle && newTitle.trim() !== tag.title) {
      const updatedTags = [...currentPlaylist.tags];
      updatedTags[tagIndex] = { ...tag, title: newTitle.trim() };

      updatePlaylist(currentPlaylist.id, { tags: updatedTags });
    }
  }, [currentPlaylist, updatePlaylist]);

  const handleRemoveFromPlaylist = useCallback((tagIndex) => {
    if (!currentPlaylist) return;

    if (window.confirm(MESSAGES.PLAYLIST.REMOVE_TAG_CONFIRM)) {
      const updatedTags = currentPlaylist.tags.filter((_, index) => index !== tagIndex);
      updatePlaylist(currentPlaylist.id, { tags: updatedTags });
    }
  }, [currentPlaylist, updatePlaylist]);

  const handleAddTagsToPlaylist = useCallback(() => {
    if (!currentPlaylist) return;

    setSelectedTags([]);
    setShowEditForm(true);
  }, [currentPlaylist]);

  const handleAddSelectedTagsToPlaylist = () => {
    if (!currentPlaylist || selectedTags.length === 0) {
      alert(MESSAGES.PLAYLIST.ADD_TAGS_ERROR);
      return;
    }

    const selectedTagObjects = tags.filter(tag => selectedTags.includes(tag.id));
    const updatedTags = [...currentPlaylist.tags, ...selectedTagObjects];

    updatePlaylist(currentPlaylist.id, { tags: updatedTags });

    setSelectedTags([]);
    setShowEditForm(false);
    alert(MESSAGES.PLAYLIST.ADD_TAGS_SUCCESS(selectedTagObjects.length));
  };

  const generateShareUrl = useCallback(() => {
    if (!currentPlaylist) return '';

    const baseUrl = window.location.origin;
    const playlistData = encodeURIComponent(JSON.stringify({
      name: currentPlaylist.name,
      tags: currentPlaylist.tags
    }));

    return `${baseUrl}/share?playlist=${playlistData}`;
  }, [currentPlaylist]);

  const handleCopyShareUrl = useCallback(() => {
    const shareUrl = generateShareUrl();
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert(MESSAGES.PLAYLIST.LINK_COPY_SUCCESS);
    }).catch(() => {
      alert(MESSAGES.PLAYLIST.LINK_COPY_ERROR);
    });
  }, [generateShareUrl]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">플레이리스트 관리</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddVideoForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-add-line mr-2"></i>
            다른 영상 추가
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={tags.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-play-list-add-line mr-2"></i>
            플레이리스트 만들기
          </button>
        </div>
      </div>

      {showAddVideoForm && (
        <AddVideoForm
          onClose={() => setShowAddVideoForm(false)}
        />
      )}

      {showCreateForm && (
        <CreatePlaylistForm
          playlistName={playlistName}
          setPlaylistName={setPlaylistName}
          selectedTags={selectedTags}
          onTagSelection={handleTagSelection}
          rating={newPlaylistRating}
          onRatingChange={setNewPlaylistRating}
          onSubmit={handleCreatePlaylist}
          onCancel={() => {
            setShowCreateForm(false);
            setPlaylistName('');
            setSelectedTags([]);
            setNewPlaylistRating(0);
          }}
          tags={tags}
        />
      )}

      {showEditForm && currentPlaylist && (
        <EditPlaylistForm
          playlist={currentPlaylist}
          selectedTags={selectedTags}
          onTagSelection={handleTagSelection}
          onSubmit={handleAddSelectedTagsToPlaylist}
          onCancel={() => {
            setShowEditForm(false);
            setSelectedTags([]);
          }}
          tags={tags}
        />
      )}

      {currentPlaylist && (
        <div className="mb-6">
          <CurrentPlaylistView
            playlist={currentPlaylist}
            isPlaying={isPlaying}
            onAddTags={handleAddTagsToPlaylist}
            onShare={useCallback(() => setShowShareModal(true), [])}
            onPlay={startPlaylist}
            onStop={stopPlaylist}
            onRatingChange={useCallback((rating) => updatePlaylistRating(currentPlaylist.id, rating), [currentPlaylist.id, updatePlaylistRating])}
          />

          <div className="bg-white rounded-b-xl shadow-lg p-4">
            <div className="space-y-3">
              {currentPlaylist.tags.map((tag, index) => (
                <PlaylistItem
                  key={`${tag.id}-${index}`}
                  tag={tag}
                  index={index}
                  isPlaying={isPlaying}
                  isCurrent={currentIndex === index}
                  onClick={() => handlePlaylistItemClick(index)}
                  onEdit={() => handleEditPlaylistTag(index)}
                  onRemove={() => handleRemoveFromPlaylist(index)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {showShareModal && currentPlaylist && (
        <LinkShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          playlistName={currentPlaylist.name}
          shareUrl={generateShareUrl()}
          onCopy={handleCopyShareUrl}
        />
      )}

      <div>
        <div className="flex gap-2 mb-4 border-b border-gray-200">
          <button
            onClick={() => setCurrentTab(TABS.MY_PLAYLISTS)}
            className={`no-theme px-4 py-2 font-medium transition-colors ${
              currentTab === TABS.MY_PLAYLISTS
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <i className="ri-play-list-line mr-2"></i>
            내 플레이리스트
          </button>
          <button
            onClick={() => setCurrentTab(TABS.SHARED)}
            className={`no-theme px-4 py-2 font-medium transition-colors ${
              currentTab === TABS.SHARED
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <i className="ri-share-line mr-2"></i>
            받은 공유
          </button>
        </div>

          {currentTab === TABS.MY_PLAYLISTS ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <i className="ri-folder-music-line text-purple-600"></i>
                  저장된 플레이리스트
                  <span className="text-sm font-normal text-gray-500">({playlists.length}개)</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">정렬:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value={SORT_OPTIONS.RATING}>평점순</option>
                    <option value={SORT_OPTIONS.DATE}>날짜순</option>
                    <option value={SORT_OPTIONS.NAME}>이름순</option>
                  </select>
                </div>
              </div>

              <PlaylistList
                playlists={playlists}
                currentPlaylist={currentPlaylist}
                sortBy={sortBy}
                onSelect={useCallback((playlist) => {
                  setCurrentPlaylist(playlist);
                  if (playlist.tags.length > 0) {
                    const firstTag = playlist.tags[0];
                    if (firstTag.videoId) {
                      setVideoId(firstTag.videoId);
                    }
                  }
                }, [setCurrentPlaylist, setVideoId])}
                onEdit={useCallback((playlist) => {
                  const newName = prompt(MESSAGES.PLAYLIST.RENAME_PROMPT, playlist.name);
                  if (newName && newName.trim() && newName.trim() !== playlist.name) {
                    renamePlaylist(playlist.id, newName.trim());
                  }
                }, [renamePlaylist])}
                onDelete={useCallback((playlist) => {
                  if (window.confirm(MESSAGES.PLAYLIST.DELETE_CONFIRM(playlist.name))) {
                    deletePlaylist(playlist.id);
                  }
                }, [deletePlaylist])}
                onShare={handleShareClick}
                onRatingChange={updatePlaylistRating}
              />
            </div>
          ) : (
            <SharedPlaylistsTab />
          )}
        </div>

      {tags.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <i className="ri-play-list-line text-4xl mb-2"></i>
          <p>{MESSAGES.PLAYLIST.NO_TAGS}</p>
        </div>
      )}

      <SharePlaylistModal
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          setSelectedPlaylistForShare(null);
        }}
        playlist={selectedPlaylistForShare}
      />
    </div>
  );
};

export { PlaylistManager };
export default PlaylistManager;
