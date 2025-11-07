
import { create } from 'zustand';

const useVideoStore = create((set, get) => ({
  // 현재 영상 정보
  currentVideoId: '',
  currentVideoTitle: '',
  player: null,
  
  // 태그 관리
  tags: [],
  
  // 플레이리스트 관리
  playlists: [],
  currentPlaylist: null,
  isPlaylistPlaying: false,
  currentPlaylistIndex: 0,
  
  // 액션들
  setVideoId: (videoId) => set({ currentVideoId: videoId }),
  
  setCurrentVideo: (videoId, title) => set({ 
    currentVideoId: videoId, 
    currentVideoTitle: title 
  }),
  
  setPlayer: (player) => set({ player }),
  
  addTag: (tag) => set((state) => ({
    tags: [...state.tags, { 
      ...tag, 
      id: Date.now().toString(),
      videoId: state.currentVideoId,
      videoTitle: state.currentVideoTitle
    }]
  })),
  
  updateTag: (tagId, updates) => set((state) => ({
    tags: state.tags.map(tag => 
      tag.id === tagId ? { ...tag, ...updates } : tag
    )
  })),
  
  deleteTag: (tagId) => set((state) => ({
    tags: state.tags.filter(tag => tag.id !== tagId)
  })),
  
  createPlaylist: (name, selectedTags) => {
    const playlist = {
      id: Date.now().toString(),
      name,
      tags: selectedTags,
      createdAt: new Date().toISOString()
    };
    
    set((state) => ({
      playlists: [...state.playlists, playlist]
    }));
    
    return playlist;
  },
  
  setCurrentPlaylist: (playlist) => set({ 
    currentPlaylist: playlist,
    currentPlaylistIndex: 0
  }),
  
  setPlaylistPlaying: (isPlaying) => set({ isPlaylistPlaying: isPlaying }),
  
  setCurrentPlaylistIndex: (index) => set({ currentPlaylistIndex: index }),
  
  nextPlaylistItem: () => set((state) => {
    const nextIndex = state.currentPlaylistIndex + 1;
    if (nextIndex < state.currentPlaylist?.tags.length) {
      return { currentPlaylistIndex: nextIndex };
    }
    return { isPlaylistPlaying: false, currentPlaylistIndex: 0 };
  }),
  
  // 다른 영상의 태그들을 현재 태그 목록에 추가
  addTagsFromVideo: (videoId, videoTitle, newTags) => set((state) => ({
    tags: [...state.tags, ...newTags.map(tag => ({
      ...tag,
      id: `${videoId}_${tag.timestamp}_${Date.now()}`,
      videoId,
      videoTitle
    }))]
  })),
  
  // 플레이리스트 업데이트
  updatePlaylist: (playlistId, updates) => set((state) => ({
    playlists: state.playlists.map(playlist =>
      playlist.id === playlistId ? { ...playlist, ...updates } : playlist
    ),
    currentPlaylist: state.currentPlaylist?.id === playlistId 
      ? { ...state.currentPlaylist, ...updates }
      : state.currentPlaylist
  }))
}));

export { useVideoStore };
export default useVideoStore;
