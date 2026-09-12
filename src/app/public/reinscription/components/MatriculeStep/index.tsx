'use client'

import { useState } from 'react'
import { lookupParMatricule, type EleveInfo, type DerniereInscriptionInfo } from '@/app/actions/reinscriptionActions'

interface MatriculeStepProps {
  matricule: string
  setMatricule: (value: string) => void
  onFound: (eleve: EleveInfo, derniereInscription: DerniereInscriptionInfo | null) => void
}

export default function MatriculeStep({ matricule, setMatricule, onFound }: MatriculeStepProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState('')

  const validateLocal = (): string => {
    const trimmed = matricule.trim()
    if (!trimmed) return 'Merci de saisir votre matricule.'
    if (!trimmed.toUpperCase().startsWith('FTM-')) {
      return 'Le matricule doit commencer par "FTM-" (ex : FTM-000125).'
    }
    return ''
  }

  const handleSubmit = async () => {
    const localError = validateLocal()
    if (localError) {
      setError(localError)
      return
    }

    setError('')
    setIsChecking(true)

    try {
      const result = await lookupParMatricule(matricule)

      if (!result.found) {
        setError("Matricule inconnu. Vérifiez le numéro reçu lors de votre inscription précédente, ou contactez la scolarité si vous pensez qu'il s'agit d'une erreur.")
        return
      }

      if (result.alreadyReinscribed) {
        setError(result.message)
        return
      }

      onFound(result.eleve, result.derniereInscription)
    } catch (err: any) {
      console.error('Erreur lookup matricule:', err)
      setError('Une erreur est survenue. Merci de réessayer.')
    } finally {
      setIsChecking(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Retrouvez votre dossier</h2>
        <p className="text-gray-600 mt-1">
          Saisissez le matricule qui vous a été attribué lors de votre inscription (ou réinscription) précédente à la FTM.
        </p>
      </div>

      <div>
        <label className="block mb-1 font-medium text-base" htmlFor="matricule">
          Matricule
        </label>
        <input
          id="matricule"
          type="text"
          value={matricule}
          onChange={(e) => setMatricule(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="FTM-000125"
          className={`w-full p-2 border rounded ${error ? 'border-red-500' : 'border-gray-300'}`}
          autoFocus
        />
        {error && <p className="text-sm text-red-600 mt-2 whitespace-pre-line">{error}</p>}
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={handleSubmit}
          disabled={isChecking}
          className={`px-4 py-2 rounded text-sm text-white ${
            isChecking ? 'bg-violet-300 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700'
          }`}
        >
          {isChecking ? 'Vérification...' : 'Continuer'}
        </button>
      </div>
    </div>
  )
}
