'use client'

import type { EleveInfo, DerniereInscriptionInfo } from '@/app/actions/reinscriptionActions'

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
  const rows: { label: string; value: string }[] = [
    { label: 'Nom', value: eleve.nom },
    { label: 'Prénom', value: eleve.prenom },
    { label: 'Email', value: derniereInscription?.email || 'Non disponible' },
    { label: 'Ville de résidence', value: derniereInscription?.ville_residence || 'Non disponible' },
    { label: 'Dernier niveau connu', value: derniereInscription?.niveau_calcule || 'Non disponible' },
    { label: 'Dernière classe connue', value: derniereInscription?.classe_attribuee || 'Non disponible' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Est-ce bien vous ?</h2>
        <p className="text-gray-600 mt-1">
          Voici les informations retrouvées dans notre dossier. Vérifiez-les avant de continuer.
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
          Ce n'est pas moi
        </button>

        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded text-sm text-white bg-violet-600 hover:bg-violet-700"
        >
          Oui, c'est bien moi
        </button>
      </div>
    </div>
  )
}
