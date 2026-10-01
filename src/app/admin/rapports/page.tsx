// src/app/admin/rapports/page.tsx
// Page d'accueil des rapports : avant, cette page affichait les 3 rapports empilés
// sur une seule page. Elle sert maintenant de hub — un clic sur une carte mène au
// rapport dédié, chacun avec sa propre URL, son titre et ses propres paramètres
// (cf. src/app/admin/rapports/{inscriptions,classes,paiements}/page.tsx).
'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/LanguageContext'

interface RapportCard {
  href: string
  icon: string
  titleKey: string
  descriptionKey: string
}

const RAPPORTS: RapportCard[] = [
  {
    href: '/admin/rapports/inscriptions',
    icon: '📋',
    titleKey: 'reports.inscriptionsTitle',
    descriptionKey: 'reports.inscriptionsCardDescription'
  },
  {
    href: '/admin/rapports/classes',
    icon: '🏫',
    titleKey: 'reports.classesTitle',
    descriptionKey: 'reports.classesCardDescription'
  },
  {
    href: '/admin/rapports/paiements',
    icon: '💰',
    titleKey: 'reports.paymentsTitle',
    descriptionKey: 'reports.paymentsCardDescription'
  }
]

export default function RapportsHubPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
        <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
        {t('reports.title')}
      </h1>
      <p className="text-gray-600">{t('reports.hubIntro')}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {RAPPORTS.map((rapport) => (
          <Link
            key={rapport.href}
            href={rapport.href}
            className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:border-[#689e4e] hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-3">{rapport.icon}</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">{t(rapport.titleKey)}</h2>
            <p className="text-sm text-gray-600 mb-3">{t(rapport.descriptionKey)}</p>
            <span className="text-sm text-[#689e4e] hover:text-[#527d3e] font-medium">
              {t('reports.viewReportButton')} →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
