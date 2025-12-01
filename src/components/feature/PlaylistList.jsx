import { useMemo } from 'react';
import { PlaylistCard } from './PlaylistCard';
import { sortPlaylists } from '../../utils/urlUtils';

export const PlaylistList = ({
  playlists,
  currentPlaylist,
  sortBy,
  onSelect,
  onEdit,
  onDelete,
  onShare,
  onRatingChange
}) => {
  const sortedPlaylists = useMemo(
    () => sortPlaylists(playlists, sortBy),
    [playlists, sortBy]
  );

  if (playlists.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <i className="ri-folder-music-line text-5xl mb-3 text-gray-300"></i>
        <p className="font-medium">아직 플레이리스트가 없습니다</p>
        <p className="text-sm mt-1">태그를 추가하고 플레이리스트를 만들어보세요!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sortedPlaylists.map((playlist) => (
        <PlaylistCard
          key={playlist.id}
          playlist={playlist}
          isSelected={currentPlaylist?.id === playlist.id}
          onSelect={() => onSelect(playlist)}
          onEdit={() => onEdit(playlist)}
          onDelete={() => onDelete(playlist)}
          onShare={() => onShare(playlist)}
          onRatingChange={(rating) => onRatingChange(playlist.id, rating)}
        />
      ))}
    </div>
  );
};

export default PlaylistList;

