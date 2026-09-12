'use client'

import type { EleveInfo, DerniereInscriptionInfo } from '@/app/actions/reinscriptionActions'
import { usePublicTranslation } from '@/lib/i18n/PublicLanguageContext'

interface ConfirmIdentityStepProps {
  eleve: EleveInfo
  derniereInscription: DerniereInscriptionInfo | null
  onConfirm: () => void
  onReject: () => void
}

export default function ConfirmIdentityStep({
  eleve,
  derniereInscription,
  onConfirm,
  onReject
}: ConfirmIdentityStepProps) {
  const { t } = usePublicTranslation()
  const notAvailable = t('reinscriptionConfirmIdentity.notAvailable')

  const rows: { label: string; value: string }[] = [
    { label: t('reinscriptionConfirmIdentity.lastNameLabel'), value: eleve.nom },
    { label: t('reinscriptionConfirmIdentity.firstNameLabel'), value: eleve.prenom },
    { label: t('reinscriptionConfirmIdentity.emailLabel'), value: derniereInscription?.email || notAvailable },
    { label: t('reinscriptionConfirmIdentity.cityLabel'), value: derniereInscription?.ville_residence || notAvailable },
    { label: t('reinscriptionConfirmIdentity.levelLabel'), value: derniereInscription?.niveau_calcule || notAvailable },
    { label: t('reinscriptionConfirmIdentity.classLabel'), value: derniereInscription?.classe_attribuee || notAvailable }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">{t('reinscriptionConfirmIdentity.title')}</h2>
        <p className="text-gray-600 mt-1">
          {t('reinscriptionConfirmIdentity.intro')}
        </p>
      </div>

      <div className="border border-gray-200 rounded overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="p-3 font-medium text-gray-700 w-1/2">{row.label}</td>
                <td className="p-3 text-gray-900">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <button
          onClick={onReject}
          className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          {t('reinscriptionConfirmIdentity.notMeButton')}
        </button>

        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded text-sm text-white bg-violet-600 hover:bg-violet-700"
        >
          {t('reinscriptionConfirmIdentity.confirmButton')}
        </button>
      </div>
    </div>
  )
}
