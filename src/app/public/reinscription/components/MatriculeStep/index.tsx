'use client'

import { useState } from 'react'
import { lookupParMatricule, type EleveInfo, type DerniereInscriptionInfo } from '@/app/actions/reinscriptionActions'
import { usePublicTranslation } from '@/lib/i18n/PublicLanguageContext'

interface MatriculeStepProps {
  matricule: string
  setMatricule: (value: string) => void
  onFound: (eleve: EleveInfo, derniereInscription: DerniereInscriptionInfo | null) => void
}

export default function MatriculeStep({ matricule, setMatricule, onFound }: MatriculeStepProps) {
  const { t } = usePublicTranslation()
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState('')

  const validateLocal = (): string => {
    const trimmed = matricule.trim()
    if (!trimmed) return t('reinscriptionMatricule.emptyError')
    if (!trimmed.toUpperCase().startsWith('FTM-')) {
      return t('reinscriptionMatricule.formatError')
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
        setError(t('reinscriptionMatricule.notFoundError'))
        return
      }

      if (result.alreadyReinscribed) {
        setError(result.message)
        return
      }

      onFound(result.eleve, result.derniereInscription)
    } catch (err: any) {
      console.error('Erreur lookup matricule:', err)
      setError(t('reinscriptionMatricule.genericError'))
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
        <h2 className="text-xl font-bold">{t('reinscriptionMatricule.title')}</h2>
        <p className="text-gray-600 mt-1">
          {t('reinscriptionMatricule.intro')}
        </p>
      </div>

      <div>
        <label className="block mb-1 font-medium text-base" htmlFor="matricule">
          {t('reinscriptionMatricule.matriculeLabel')}
        </label>
        <input
          id="matricule"
          type="text"
          value={matricule}
          onChange={(e) => setMatricule(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('reinscriptionMatricule.matriculePlaceholder')}
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
          {isChecking ? t('reinscriptionMatricule.checkingButton') : t('reinscriptionMatricule.continueButton')}
        </button>
      </div>
    </div>
  )
}
