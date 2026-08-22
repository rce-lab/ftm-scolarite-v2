'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getConfig } from '@/lib/config'
import { PublicLanguageProvider, usePublicTranslation } from '@/lib/i18n/PublicLanguageContext'
import logo from './public/logo FTM officiel 2024.jpeg'

function HomePageContent() {
  const { t, language, setLanguage } = usePublicTranslation()
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    const conf = await getConfig()
    setConfig(conf)
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#689e4e]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center border-t-4 border-[#b03c2d]">
        <div className="text-right mb-2">
          <button
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="text-sm text-[#689e4e] hover:text-[#527d3e] underline"
          >
            {language === 'fr' ? 'English version' : 'Version française'}
          </button>
        </div>

        <div className="flex justify-center mb-4">
          <Image src={logo} alt={t('homepage.logoAlt')} className="h-24 w-auto" priority />
        </div>

        <h1 className="text-4xl font-bold text-[#689e4e]">FTM</h1>
        <p className="text-gray-600 mt-1">Fianarana Teny Malagasy</p>

        <p className="text-sm text-gray-700 mt-4">
          {t('homepage.schoolYear').replace('{annee}', config.annee_scolaire_courante)}
        </p>

        <p className="text-sm text-gray-700 mt-1">
          {config.adresse_association}
        </p>

        <Link
          href="/public/inscription"
          className="inline-block mt-6 bg-[#689e4e] text-white px-6 py-3 rounded font-medium hover:opacity-90"
        >
          {t('homepage.ctaButton')}
        </Link>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <PublicLanguageProvider>
      <HomePageContent />
    </PublicLanguageProvider>
  )
}
