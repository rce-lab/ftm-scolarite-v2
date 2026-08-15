'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { getConfig } from '@/lib/config'

function ConfirmationContent() {
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

  if (!config) return <div className="p-8 text-center">Chargement...</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          ✓
        </div>
        <h1 className="text-3xl font-bold">Inscription reçue et enregistrée</h1>
        <p className="text-gray-600 mt-2">Votre inscription a été enregistrée avec succès</p>
      </div>

      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Votre code étudiant</h2>
        <div className="bg-blue-50 p-4 rounded text-center">
          <p className="text-2xl font-bold text-blue-700">{code}</p>
          <p className="text-sm text-gray-600 mt-2">Conservez ce code pour toute communication</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Instructions de paiement</h2>
        <div className="space-y-3">
          <p>Pour finaliser votre inscription, effectuez le paiement de <strong>{config.montant_inscription}€</strong> :</p>
          <div className="bg-gray-50 p-4 rounded">
            <p><strong>Bénéficiaire:</strong> {config.beneficiaire}</p>
            <p><strong>RIB/IBAN:</strong> {config.rib_banque}</p>
            <p><strong>Montant:</strong> {config.montant_inscription}€</p>
            <p><strong>Référence:</strong> {code}</p>
          </div>
          <p className="text-sm text-gray-600">Votre place sera confirmée après réception du paiement.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Prochaines étapes</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Effectuez le paiement de {config.montant_inscription}€</li>
          <li>Recevez une confirmation par email sous 48h</li>
          <li>Vous serez affecté à une classe selon votre niveau</li>
          <li>Recevez le lien Zoom pour les cours</li>
        </ol>
        
        <div className="mt-6 p-4 bg-blue-50 rounded">
          <p className="font-bold">Contact</p>
          <p>Pour toute question : {config.email_communication}</p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="inline-block bg-gray-100 border border-gray-300 rounded px-4 py-3">
          <p className="text-gray-700 font-bold">Vous pouvez fermer cet onglet.</p>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Chargement...</div>}>
      <ConfirmationContent />
    </Suspense>
  )
}