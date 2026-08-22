'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { getConfig } from '@/lib/config'
import { PublicLanguageProvider, usePublicTranslation } from '@/lib/i18n/PublicLanguageContext'

function ConfirmationContent() {
  const { t, language, setLanguage } = usePublicTranslation()
  const params = useSearchParams()
  const code = params.get('code')
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    const conf = await getConfig()
    setConfig(conf)
  }

  if (!config) return <div className="p-8 text-center">{t('confirmation.loading')}</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-right mb-4">
        <button
          onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
          className="text-sm text-[#689e4e] hover:text-[#527d3e] underline"
        >
          {language === 'fr' ? 'English version' : 'Version française'}
        </button>
      </div>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          ✓
        </div>
        <h1 className="text-3xl font-bold">{t('confirmation.title')}</h1>
        <p className="text-gray-600 mt-2">{t('confirmation.subtitle')}</p>
      </div>

      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-bold mb-4">{t('confirmation.studentCodeTitle')}</h2>
        <div className="bg-blue-50 p-4 rounded text-center">
          <p className="text-2xl font-bold text-blue-700">{code}</p>
          <p className="text-base text-gray-600 mt-2">{t('confirmation.keepCodeHint')}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-bold mb-4">{t('confirmation.paymentInstructionsTitle')}</h2>
        <div className="space-y-3">
          <p>{t('confirmation.paymentIntro').replace('{montant}', String(config.montant_inscription))}</p>
          <div className="bg-gray-50 p-4 rounded">
            <p><strong>{t('confirmation.beneficiaryLabel')}</strong> {config.beneficiaire}</p>
            <p><strong>{t('confirmation.ribLabel')}</strong> {config.rib_banque}</p>
            <p><strong>{t('confirmation.amountLabel')}</strong> {config.montant_inscription}€</p>
            <p><strong>{t('confirmation.referenceLabel')}</strong> {code}</p>
          </div>
          <p className="text-base text-gray-600">{t('confirmation.paymentConfirmationHint')}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">{t('confirmation.nextStepsTitle')}</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>{t('confirmation.nextStepPay').replace('{montant}', String(config.montant_inscription))}</li>
          <li>{t('confirmation.nextStepEmailConfirmation')}</li>
          <li>{t('confirmation.nextStepClassAssignment')}</li>
          <li>{t('confirmation.nextStepZoomLink')}</li>
        </ol>

        <div className="mt-6 p-4 bg-blue-50 rounded">
          <p className="font-bold">{t('confirmation.contactLabel')}</p>
          <p>{t('confirmation.contactQuestionHint').replace('{email}', config.email_communication)}</p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="inline-block bg-gray-100 border border-gray-300 rounded px-4 py-3">
          <p className="text-gray-700 font-bold">{t('confirmation.closeTabNotice')}</p>
        </div>
      </div>
    </div>
  )
}

function ConfirmationPageContent() {
  const { t } = usePublicTranslation()
  return (
    <Suspense fallback={<div className="p-8 text-center">{t('confirmation.loading')}</div>}>
      <ConfirmationContent />
    </Suspense>
  )
}

export default function ConfirmationPage() {
  return (
    <PublicLanguageProvider>
      <ConfirmationPageContent />
    </PublicLanguageProvider>
  )
}
