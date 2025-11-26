// src/components/ThemeDropdown.jsx
import { useState } from 'react';
import { useThemeStore } from '../stores/themeStore';

const THEME_OPTIONS = [
  'red',
  'blue',
  'yellow',
  'pink',
  'green',
  'lavender',
  'lightpink',
  'brown',
  'orange',
];

export default function ThemeDropdown() {
  const [open, setOpen] = useState(false);
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  return (
    <div className="flex justify-end">
      <div className="relative inline-block text-left">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="
            inline-flex items-center justify-center
            px-4 py-2 rounded-full text-sm font-medium
            bg-[var(--accent-color)] text-white
            hover:opacity-90 active:scale-95
            transition shadow
          "
        >
          Theme
          <i className="ri-arrow-down-s-line ml-1 text-base" />
        </button>

        {open && (
          <div
            className="
              absolute right-0 mt-2 w-32
              bg-white border border-gray-200 rounded-lg shadow-lg
              z-50
            "
          >
            {THEME_OPTIONS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  setTheme(color);
                  setOpen(false);
                }}
                className={`
                  w-full text-left px-3 py-1.5 text-sm
                  hover:bg-gray-100
                  ${color === theme ? 'font-semibold text-gray-900' : 'text-gray-700'}
                `}
              >
                {color}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
