'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import logo from '../logo FTM officiel 2024.jpeg'

import MatriculeStep from './components/MatriculeStep'
import ConfirmIdentityStep from './components/ConfirmIdentityStep'
import VariableFieldsStep from './components/VariableFieldsStep'
import type { EleveInfo, DerniereInscriptionInfo } from '@/app/actions/reinscriptionActions'

const STEPS = ['Matricule', 'Confirmation', 'Mise à jour']

// Stepper local à la réinscription : le Stepper partagé (src/app/public/inscription)
// a 5 étapes avec des libellés propres au formulaire d'inscription classique
// (Informations, Disponibilités, Motivation...) qui ne correspondent pas à ce
// parcours à 3 étapes. Accent violet pour distinguer visuellement ce parcours
// de la nouvelle inscription (aucune couleur dédiée trouvée dans la charte
// existante — cf. résumé de fin de tâche).
function ReinscriptionStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between">
        {STEPS.map((label, i) => {
          const stepNumber = i + 1
          return (
            <div key={label} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 border-2 ${
                  currentStep >= stepNumber
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {stepNumber}
              </div>
              <span
                className={`text-sm ${currentStep >= stepNumber ? 'font-medium text-violet-600' : 'text-gray-700'}`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
      <div className="relative mt-4">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 -translate-y-1/2" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-violet-600 -translate-y-1/2 transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}

export default function ReinscriptionPage() {
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState(1)
  const [matricule, setMatricule] = useState('')
  const [eleve, setEleve] = useState<EleveInfo | null>(null)
  const [derniereInscription, setDerniereInscription] = useState<DerniereInscriptionInfo | null>(null)
  const [submitted, setSubmitted] = useState(false)

  // Avertit avant de quitter la page tant que la réinscription n'a pas été soumise
  useEffect(() => {
    const shouldWarn = !submitted
    if (!shouldWarn) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [submitted])

  const handleFound = (foundEleve: EleveInfo, derniere: DerniereInscriptionInfo | null) => {
    setEleve(foundEleve)
    setDerniereInscription(derniere)
    setCurrentStep(2)
  }

  const handleReject = () => {
    setMatricule('')
    setEleve(null)
    setDerniereInscription(null)
    setCurrentStep(1)
  }

  const handleConfirm = () => {
    setCurrentStep(3)
  }

  // Même parcours post-soumission que le formulaire d'inscription classique
  // (src/app/public/inscription/page.tsx) : redirection vers /public/confirmation
  // avec le code en query string, qui affiche là-bas le suivi de paiement.
  const handleSubmitted = (code: string) => {
    setSubmitted(true)
    router.push(`/public/confirmation?code=${code}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
        {/* En-tête, même charte que le formulaire d'inscription, accent violet distinctif */}
        <div className="mb-6 text-center border-b-4 border-violet-600 pb-6">
          <div className="flex justify-center mb-4">
            <Image src={logo} alt="Logo FTM" className="h-24 w-auto" priority />
          </div>
          <h1 className="text-2xl font-bold text-[#689e4e]">Réinscription</h1>
          <p className="text-gray-600 mt-1">
            Vous avez déjà été élève à la FTM ? Retrouvez votre dossier et réinscrivez-vous en quelques instants.
          </p>
        </div>

        {!submitted && <ReinscriptionStepper currentStep={currentStep} />}

        {!submitted && currentStep === 1 && (
          <MatriculeStep matricule={matricule} setMatricule={setMatricule} onFound={handleFound} />
        )}

        {!submitted && currentStep === 2 && eleve && (
          <ConfirmIdentityStep
            eleve={eleve}
            derniereInscription={derniereInscription}
            onConfirm={handleConfirm}
            onReject={handleReject}
          />
        )}

        {!submitted && currentStep === 3 && eleve && (
          <VariableFieldsStep
            eleveId={eleve.id}
            derniereInscription={derniereInscription}
            onSubmitted={handleSubmitted}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {submitted && (
          <div className="text-center text-gray-600 py-8">Redirection en cours...</div>
        )}
      </div>
    </div>
  )
}
