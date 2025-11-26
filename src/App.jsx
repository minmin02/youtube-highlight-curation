
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './router'
import { useEffect } from 'react'
import { useThemeStore } from './stores/themeStore' // zustand 테마 store 불러오기
import ThemeDropdown from './components/ThemeDropdown'



function App() {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)

  //테마 클래스 body에 적용
  useEffect(() => {
    document.body.className = ''
    document.body.classList.add(`theme-${theme}`)
  }, [theme])

  return (
    <BrowserRouter basename={__BASE_PATH__}>
   <AppRoutes />
</BrowserRouter>

  )
}

export default App
