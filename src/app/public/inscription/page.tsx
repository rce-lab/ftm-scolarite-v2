// src/app/public/inscription/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { getConfig } from '@/lib/config'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { PublicLanguageProvider, usePublicTranslation } from '@/lib/i18n/PublicLanguageContext'
import logo from '../logo FTM officiel 2024.jpeg'

// Composants
import Stepper from './components/common/Stepper'
import PersonalInfoStep from './components/PersonalInfoStep'
import DisponibilitesStep from './components/DisponibilitesStep'
import MotivationStep from './components/MotivationStep'
import InitialAssessmentStep from './components/InitialAssessmentStep'
import ContactStep from './components/ContactStep'

// Hooks
import { useInscriptionForm } from './hooks/useInscriptionForm'
import { sendInscriptionNotificationAction } from '@/app/actions/emailActions'

function InscriptionPageContent() {
  const router = useRouter()
  const { language, setLanguage } = usePublicTranslation()
  const [config, setConfig] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)

  // Hooks personnalisés
  const { formData, updateFormData } = useInscriptionForm()

  useEffect(() => {
    loadConfig()
  }, [])

  // Avertit l'utilisateur avant de quitter la page tant que le formulaire n'a pas été soumis avec succès
  useEffect(() => {
    const shouldWarn = currentStep < 5 || (currentStep === 5 && !submitted)
    if (!shouldWarn) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [currentStep, submitted])

  const loadConfig = async () => {
    const conf = await getConfig()
    setConfig(conf)
  }

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 5))
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    let codeTemporaire = ''
    
    try {
      console.log('Soumission inscription en cours...')
      
      // 1. Générer code étudiant
      const anneeStr = config?.annee_scolaire_courante?.toString() || '2025'
      const annee = anneeStr.slice(-2)
      const prefixe = config?.prefixe_code_etudiant || 'FTM'
      codeTemporaire = `${prefixe}-${annee}-${Date.now().toString().slice(-6)}`
      
      // 2. Préparer données
      const dataToInsert = {
        // Informations personnelles
        nom: formData.nom,
        prenom: formData.prenom,
        age: formData.age ? parseInt(formData.age) : null,
        pays_residence: formData.pays_residence,
        ville_residence: formData.ville_residence,
        responsable_legal: formData.responsable_legal || null,
        email_contact: formData.email_contact,
        adresse_postale: formData.adresse_postale,
        telephone: formData.telephone,
        indicatif_pays: formData.indicatif_pays,
        photo_url: formData.photo_url || null,

        // Disponibilités
        jours_preference: formData.jours_preference,
        horaire_apres_midi: formData.horaire_apres_midi,
        horaire_soir: formData.horaire_soir,
        horaire_autre: formData.horaire_autre,
        horaire_autre_detail: formData.horaire_autre_detail || null,
        
        // Motivation
        raison_maternelle: formData.raison_maternelle,
        raison_competences: formData.raison_competences,
        raison_plaisir: formData.raison_plaisir,
        raison_autre: formData.raison_autre,
        raison_autre_detail: formData.raison_autre_detail || null,
        attentes_formation: formData.attentes_formation,
        
        // Comment avez-vous connu
        connaitre_connaissances: formData.connaitre_connaissances,
        connaitre_association: formData.connaitre_association,
        connaitre_ancien_eleve: formData.connaitre_ancien_eleve,
        connaitre_recommandation: formData.connaitre_recommandation,
        connaitre_autre: formData.connaitre_autre,
        connaitre_autre_detail: formData.connaitre_autre_detail || null,
        
        // Remarques
        remarques: formData.remarques || null,
        
        // Évaluation
        niveau_suggere: formData.niveau_suggere || 'A1',
        reponses_competences: formData.competences || {},
        scores_calculs: {},
        
        // Métadonnées
        student_code: codeTemporaire,
        status: 'pending_review',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('Données à insérer:', dataToInsert)
      
      // 3. Insérer
      const { error } = await supabase
        .from('inscriptions')
        .insert([dataToInsert])

      if (error) {
        console.error('Erreur Supabase:', error)
        throw new Error(`Erreur: ${error.message}`)
      }

      console.log('✅ Insertion réussie')

      // 4. Notifier par email (candidat + admin)
      const destinataires = [config.email_communication]
      if (config.email_responsable_scolarite) destinataires.push(config.email_responsable_scolarite)
      if (config.email_responsable_administratif) destinataires.push(config.email_responsable_administratif)

      sendInscriptionNotificationAction(dataToInsert, destinataires).catch(
        (err) => console.error('Erreur envoi email inscription:', err)
      )

      // 5. Rediriger
      setSubmitted(true)
      router.push(`/public/confirmation?code=${codeTemporaire}`)
      
    } catch (error: any) {
      console.error('❌ Erreur:', error)
      alert(`Erreur: ${error.message || 'Inconnue'}\n\nVeuillez réessayer.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
        {/* En-tête avec logo et branding FTM */}
        <div className="mb-6 text-center border-b-4 border-[#b03c2d] pb-6">
          <div className="text-right">
            <button
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              className="text-sm text-[#689e4e] hover:text-[#527d3e] underline"
            >
              {language === 'fr' ? 'English version' : 'Version française'}
            </button>
          </div>
          <div className="flex justify-center mb-4">
            <Image src={logo} alt="Logo FTM" className="h-24 w-auto" priority />
          </div>
          <h1 className="text-2xl font-bold text-[#689e4e]">Inscription aux cours de Malagasy</h1>
          <p className="text-gray-600 mt-1">
            FTM - Formation en langue Malagasy
          </p>
          <p className="text-sm text-gray-700 mt-1">
            Année scolaire {config.annee_scolaire_courante}
          </p>
        </div>

        {/* Stepper visuel (5 étapes) */}
        <Stepper currentStep={currentStep} totalSteps={5} />

        {/* Étape 1 : Informations personnelles */}
        {currentStep === 1 && (
          <PersonalInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={() => router.push('/')}
            config={config}
          />
        )}

        {/* Étape 2 : Disponibilités */}
        {currentStep === 2 && (
          <DisponibilitesStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {/* Étape 3 : Motivation et attentes */}
        {currentStep === 3 && (
          <MotivationStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {/* Étape 4 : Évaluation initiale */}
        {currentStep === 4 && (
          <InitialAssessmentStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
            config={config}
          />
        )}

        {/* Étape 5 : Contact et finalisation */}
        {currentStep === 5 && (
          <ContactStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleSubmit}
            onBack={handleBack}
            config={config}
          />
        )}

        {/* Chargement */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4">Enregistrement en cours...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function InscriptionPage() {
  return (
    <PublicLanguageProvider>
      <InscriptionPageContent />
    </PublicLanguageProvider>
  )
}