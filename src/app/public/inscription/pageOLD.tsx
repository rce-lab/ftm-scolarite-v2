'use client'

import { useState, useEffect } from 'react'
import { RadioGroup } from '@/components/ui/RadioButton'
import { getConfig } from '@/lib/config'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function InscriptionPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState<any>(null)
  const [aucuneNotion, setAucuneNotion] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    age: '',
    email_contact: '',
    telephone: '',
    niveau_suggere: ''
  })
  // Ajoutez ces états en haut du composant, après les autres useState
  const [competenceResponses, setCompetenceResponses] = useState<Record<string, string>>({});
  const [showGrille, setShowGrille] = useState(false);

  useEffect(() => {
    loadConfig()
  }, [])

  useEffect(() => {
    if (aucuneNotion === 'oui') {
      setFormData(prev => ({ ...prev, niveau_suggere: 'A1' }))
      setStep(3) // Passer directement à l'étape 3 (contact)
    }
  }, [aucuneNotion])

  const loadConfig = async () => {
    const conf = await getConfig()
    setConfig(conf)
  }

const handleSubmit = async () => {
  let codeTemporaire = '';
  
  try {
    console.log('=== DÉBUT handleSubmit ===');
    
    // 1. Récupérer la configuration
    if (!config) {
      console.error('Config non chargée');
      alert('Erreur: Configuration non chargée. Veuillez rafraîchir la page.');
      return;
    }
    
    console.log('Config:', config);
    
    // 2. Générer le code étudiant
    try {
      // S'assurer que annee_scolaire_courante est une string
      const anneeStr = config.annee_scolaire_courante?.toString() || '2025';
      console.log('Annee scolaire (string):', anneeStr);
      
      const annee = anneeStr.slice(-2); // Prendre les 2 derniers caractères
      const prefixe = config.prefixe_code_etudiant || 'FTM';
      
      // Générer un code unique avec timestamp
      const timestamp = Date.now().toString();
      const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();
      codeTemporaire = `${prefixe}-${annee}-${randomPart}-${timestamp.slice(-4)}`;
      
      console.log('Code temporaire généré:', codeTemporaire);
    } catch (error) {
      console.error('Erreur génération code:', error);
      // Code de secours
      codeTemporaire = `FTM-25-${Date.now().toString().slice(-8)}`;
      console.log('Code secours:', codeTemporaire);
    }
    
    // 3. Valider les données requises
    if (!formData.nom || !formData.prenom || !formData.email_contact || !formData.telephone) {
      alert('Veuillez remplir tous les champs obligatoires (Nom, Prénom, Email, Téléphone)');
      return;
    }
    
    // 4. Préparer les données pour Supabase
    const dataToInsert = {
      // Données obligatoires
      nom: formData.nom.trim(),
      prenom: formData.prenom.trim(),
      email_contact: formData.email_contact.trim(),
      telephone: formData.telephone.trim(),
      student_code: codeTemporaire,
      status: 'pending_review',
      
      // Données optionnelles
      age: formData.age ? parseInt(formData.age) : null,
      niveau_suggere: formData.niveau_suggere || 'A1',
      
      // Champs par défaut
      reponses_competences: {},
      scores_calculs: {},
      
      // Timestamps
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Données prêtes pour insertion:', dataToInsert);
    
    // 5. Insérer dans Supabase
    console.log('Envoi à Supabase...');
    const { data, error } = await supabase
      .from('inscriptions')
      .insert([dataToInsert])
      .select();
    
    // 6. Gérer la réponse
    if (error) {
      console.error('Erreur Supabase détaillée:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Vérifier si c'est une erreur de duplication
      if (error.code === '23505') {
        alert('Erreur: Ce code étudiant existe déjà. Veuillez réessayer.');
      } else if (error.message.includes('null value in column')) {
        alert('Erreur: Données manquantes. Vérifiez que tous les champs obligatoires sont remplis.');
      } else {
        alert(`Erreur technique: ${error.message}\n\nCode: ${codeTemporaire}\n\nVeuillez contacter l'administrateur.`);
      }
      return;
    }
    
    // 7. Succès
    console.log('✅ Insertion réussie:', data);
    
    // 8. Envoyer notification (optionnel pour le moment)
    if (config.email_communication) {
      console.log('Envoi notification à:', config.email_communication);
      // À implémenter plus tard
    }
    
    // 9. Rediriger vers la page de confirmation
    console.log('Redirection vers confirmation avec code:', codeTemporaire);
    router.push(`/public/confirmation?code=${encodeURIComponent(codeTemporaire)}`);
    
  } catch (error: any) {
    // 10. Gestion des erreurs générales
    console.error('❌ Erreur générale dans handleSubmit:', {
      message: error.message,
      stack: error.stack,
      codeTemporaire: codeTemporaire || 'Non généré'
    });
    
    let messageErreur = 'Une erreur inattendue est survenue.';
    
    if (error.message.includes('Failed to fetch')) {
      messageErreur = 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
    } else if (error.message.includes('Network Error')) {
      messageErreur = 'Erreur réseau. Veuillez vérifier votre connexion.';
    } else if (error.message.includes('timeout')) {
      messageErreur = 'Délai d\'attente dépassé. Veuillez réessayer.';
    }
    
    alert(`${messageErreur}\n\nCode étudiant: ${codeTemporaire || 'Non généré'}\n\nConservez ce code et contactez-nous si le problème persiste.`);
  } finally {
    console.log('=== FIN handleSubmit ===');
  }
};
  if (!config) return <div className="p-8 text-center">Chargement...</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Inscription FTM Malagasy</h1>
      <p className="text-gray-600 mb-8">Formulaire simplifié pour le MVP</p>

      {/* Indicateur d'étapes */}
      <div className="flex mb-8">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex-1 text-center">
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
              step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              {num}
            </div>
            <p className="mt-2 text-sm">
              {num === 1 && 'Infos'}
              {num === 2 && 'Niveau'}
              {num === 3 && 'Contact'}
            </p>
          </div>
        ))}
      </div>

      {/* Étape 1: Informations de base */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Informations personnelles</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Nom *</label>
              <input
                type="text"
                className="w-full p-3 border rounded"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block mb-2">Prénom *</label>
              <input
                type="text"
                className="w-full p-3 border rounded"
                value={formData.prenom}
                onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block mb-2">Âge *</label>
              <input
                type="number"
                className="w-full p-3 border rounded"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                required
              />
            </div>
          </div>

          <button 
            onClick={() => setStep(2)}
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
          >
            Suivant → Évaluation
          </button>
        </div>
      )}

      {/* Étape 2: Question cruciale */}
      {/* Étape 2: Question cruciale */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Évaluation initiale</h2>
          
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <p className="text-lg font-medium mb-4">
              Je n'ai aucune notion (parlé/écrit) de la langue malagasy.
            </p>
            
            <RadioGroup
              name="aucune_notion"
              options={[
                { value: 'oui', label: 'Oui' },
                { value: 'un_peu', label: 'Un peu' },
                { value: 'non', label: 'Non' }
              ]}
              value={aucuneNotion}
              onChange={(value) => {
                setAucuneNotion(value);
                if (value === 'oui') {
                  setFormData(prev => ({ ...prev, niveau_suggere: 'A1' }));
                }
              }}
            />
            
            {aucuneNotion === 'oui' && (
              <div className="mt-4 p-3 bg-green-50 rounded">
                <p className="font-bold">✓ Vous serez classé en niveau A1</p>
                <p className="text-base">Pas besoin de remplir la grille complète.</p>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button 
              onClick={() => setStep(1)}
              className="px-6 py-2 border rounded"
            >
              ← Retour
            </button>
            
            <button 
              onClick={() => {
                if (!aucuneNotion) {
                  alert('Veuillez répondre à la question');
                  return;
                }
                
                if (aucuneNotion === 'oui') {
                  // Directement au contact (étape 3)
                  setStep(3);
                } else {
                  // Afficher la grille
                  setShowGrille(true);
                }
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
      {/* Étape 3: Contact et finalisation */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Informations de contact</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Email *</label>
              <input
                type="email"
                className="w-full p-3 border rounded"
                value={formData.email_contact}
                onChange={(e) => setFormData({...formData, email_contact: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block mb-2">Téléphone *</label>
              <input
                type="tel"
                className="w-full p-3 border rounded"
                value={formData.telephone}
                onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded">
            <p><strong>Niveau suggéré:</strong> {formData.niveau_suggere || 'À déterminer'}</p>
            <p><strong>Frais d'inscription:</strong> {config.montant_inscription}€</p>
          </div>

          <div className="flex justify-between">
            <button 
              onClick={() => setStep(aucuneNotion === 'oui' ? 2 : 1)}
              className="px-6 py-2 border rounded"
            >
              ← Retour
            </button>
            
            <button 
              onClick={handleSubmit}
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
            >
              Confirmer l'inscription
            </button>
          </div>
        </div>
      )}
    </div>
  )
}