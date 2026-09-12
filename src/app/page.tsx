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
      <div className="max-w-2xl w-full bg-white rounded-lg shadow p-8 text-center border-t-4 border-[#b03c2d]">
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

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{t('homepage.welcomeTitle')}</h2>
          <p className="text-gray-600 mt-1">{t('homepage.chooseIntro')}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-left">
            <Link
              href="/public/inscription"
              className="block p-5 rounded-lg border-2 border-gray-200 hover:border-[#689e4e] hover:bg-[#689e4e]/5 transition-colors"
            >
              <div className="text-2xl mb-2">🆕</div>
              <div className="font-bold text-[#689e4e]">{t('homepage.newInscriptionTitle')}</div>
              <p className="text-sm text-gray-600 mt-1">{t('homepage.newInscriptionSubtitle')}</p>
            </Link>

            <Link
              href="/public/reinscription"
              className="block p-5 rounded-lg border-2 border-gray-200 hover:border-violet-600 hover:bg-violet-50 transition-colors"
            >
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-bold text-violet-700">{t('reinscriptionHeader.title')}</div>
              <p className="text-sm text-gray-600 mt-1">{t('homepage.reinscriptionSubtitle')}</p>
            </Link>
          </div>
        </div>
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
