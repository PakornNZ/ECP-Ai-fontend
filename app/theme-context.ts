import { useEffect, useState } from 'react'

type ThemeType = 'system' | 'light' | 'dark'

export const useTheme = () => {
    const [theme, setThemeState] = useState<ThemeType>('system')

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as ThemeType
        if (savedTheme) {
            applyTheme(savedTheme)
        } else {
            applyTheme('system')
        }
    }, [])

    const applyTheme = (newTheme: ThemeType) => {
        setThemeState(newTheme)
        localStorage.setItem('theme', newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
    }

    return { theme, setTheme: applyTheme }
}
