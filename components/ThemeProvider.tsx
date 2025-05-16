'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'bulk-messaging-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    
    if (stored) {
      setTheme(stored)
    } else {
      setTheme(systemTheme)
    }
    setMounted(true)
  }, [storageKey])

  useEffect(() => {
    if (!mounted) return
    
    const root = window.document.documentElement
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    
    // Add theme transition disable class temporarily
    root.classList.add('theme-transition-disable')
    
    // Add new theme class
    root.classList.add(theme)
    
    // Store theme preference
    localStorage.setItem(storageKey, theme)
    
    // Re-enable transitions after a brief delay
    setTimeout(() => {
      root.classList.remove('theme-transition-disable')
    }, 1)
  }, [theme, storageKey, mounted])

  const value = {
    theme,
    setTheme,
  }

  // Prevent flash by not rendering until mounted
  if (!mounted) {
    return null
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
