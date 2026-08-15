'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { translations } from './translations'

type Language = 'fr' | 'mg'

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

const STORAGE_KEY = 'ftm_language'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'fr' || stored === 'mg') {
      setLanguageState(stored)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
  }

  const t = (key: string): string => {
    const parts = key.split('.')
    let node: any = translations
    for (const part of parts) {
      node = node?.[part]
    }

    if (!node || typeof node.fr !== 'string') {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n] Clé de traduction introuvable : "${key}"`)
      }
      return key
    }

    if (language === 'mg') {
      if (typeof node.mg !== 'string' || node.mg === '') {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[i18n] Traduction malgache manquante pour "${key}", repli sur le français`)
        }
        return node.fr
      }
      return node.mg
    }

    return node.fr
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error("useTranslation doit être utilisé à l'intérieur d'un <LanguageProvider>")
  }
  return ctx
}
