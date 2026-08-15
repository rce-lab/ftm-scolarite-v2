'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestConnexion() {
  useEffect(() => {
    testConnexion()
  }, [])

  const testConnexion = async () => {
    try {
      console.log('Test connexion Supabase...')
      
      // Test 1: Lire la configuration
      const { data: config, error: configError } = await supabase
        .from('configuration')
        .select('key, value')
        .limit(1)
      
      console.log('Test config:', { config, configError })
      
      // Test 2: Insérer un test
      const testData = {
        nom: 'Test',
        prenom: 'Connexion',
        email_contact: 'test@test.com',
        telephone: '0000000000',
        student_code: 'TEST-123',
        status: 'pending_review',
        reponses_competences: {},
        created_at: new Date().toISOString()
      }
      
      const { data: insert, error: insertError } = await supabase
        .from('inscriptions')
        .insert([testData])
        .select()
      
      console.log('Test insertion:', { insert, insertError })
      
      // Test 3: Supprimer le test
      if (insert && insert[0]?.id) {
        const { error: deleteError } = await supabase
          .from('inscriptions')
          .delete()
          .eq('id', insert[0].id)
        
        console.log('Test suppression:', { deleteError })
      }
      
    } catch (error) {
      console.error('Erreur test:', error)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Connexion Supabase</h1>
      <p>Vérifiez la console du navigateur (F12 → Console)</p>
    </div>
  )
}