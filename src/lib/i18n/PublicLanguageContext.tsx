'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { publicTranslations } from './publicTranslations'

type PublicLanguage = 'fr' | 'en'

interface PublicLanguageContextValue {
  language: PublicLanguage
  setLanguage: (lang: PublicLanguage) => void
  t: (key: string) => string
}

const PublicLanguageContext = createContext<PublicLanguageContextValue | undefined>(undefined)

export function PublicLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<PublicLanguage>('fr')

  const t = (key: string): string => {
    const parts = key.split('.')
    let node: any = publicTranslations
    for (const part of parts) {
      node = node?.[part]
    }

    if (!node || typeof node.fr !== 'string') {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[public-i18n] Clé de traduction introuvable : "${key}"`)
      }
      return key
    }

    if (language === 'en') {
      if (typeof node.en !== 'string' || node.en === '') {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[public-i18n] Traduction anglaise manquante pour "${key}", repli sur le français`)
        }
        return node.fr
      }
      return node.en
    }

    return node.fr
  }

  return (
    <PublicLanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </PublicLanguageContext.Provider>
  )
}

export function usePublicTranslation() {
  const ctx = useContext(PublicLanguageContext)
  if (!ctx) {
    throw new Error("usePublicTranslation doit être utilisé à l'intérieur d'un <PublicLanguageProvider>")
  }
  return ctx
}
