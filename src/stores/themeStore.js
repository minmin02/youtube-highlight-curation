import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  theme: 'red', // 기본 테마
  setTheme: (newTheme) => set({ theme: newTheme }), // 테마 변경 함수
}));
