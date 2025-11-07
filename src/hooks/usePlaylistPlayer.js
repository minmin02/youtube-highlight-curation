
import { useState, useEffect } from 'react';
import useVideoStore from '../stores/useVideoStore';

const usePlaylistPlayer = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  
  const { 
    currentPlaylist, 
    setCurrentVideo, 
    player 
  } = useVideoStore();

  useEffect(() => {
    if (currentPlaylist && currentPlaylist.tags && currentPlaylist.tags.length > 0) {
      const firstTag = currentPlaylist.tags[0];
      setCurrentItem(firstTag);
    }
  }, [currentPlaylist]);

  const jumpToPlaylistItem = (index) => {
    if (!currentPlaylist || !currentPlaylist.tags || index < 0 || index >= currentPlaylist.tags.length) return;

    const tag = currentPlaylist.tags[index];
    setCurrentIndex(index);
    setCurrentItem(tag);
    
    // 영상 변경
    setCurrentVideo(tag.videoId, tag.videoTitle || '');
    
    // 플레이어가 준비되면 해당 시간으로 이동
    setTimeout(() => {
      if (player && player.seekTo) {
        player.seekTo(tag.timestamp, true);
      }
    }, 1000);
  };

  const startPlaylist = () => {
    if (!currentPlaylist || !currentPlaylist.tags || currentPlaylist.tags.length === 0) return;
    
    setIsPlaying(true);
    jumpToPlaylistItem(0);
  };

  const stopPlaylist = () => {
    setIsPlaying(false);
  };

  const playNext = () => {
    if (!currentPlaylist || !currentPlaylist.tags || currentIndex >= currentPlaylist.tags.length - 1) {
      setIsPlaying(false);
      return;
    }
    jumpToPlaylistItem(currentIndex + 1);
  };

  const playPrevious = () => {
    if (currentIndex <= 0) return;
    jumpToPlaylistItem(currentIndex - 1);
  };

  return {
    currentIndex,
    isPlaying,
    currentItem,
    playNext,
    playPrevious,
    jumpToPlaylistItem,
    startPlaylist,
    stopPlaylist
  };
};

export default usePlaylistPlayer;
