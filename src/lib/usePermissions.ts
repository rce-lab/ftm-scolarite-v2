// src/lib/usePermissions.ts
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { niveauPourRole, type Ecran, type Niveau } from '@/lib/permissions'

interface UsePermissionsResult {
  role: string | null
  loading: boolean
  niveau: (ecran: Ecran) => Niveau
}

// Charge le rôle de l'utilisateur connecté une seule fois (table `utilisateurs`,
// clé `auth_user_id`) et expose `niveau(ecran)` pour interroger la table
// ROLE_PERMISSIONS de src/lib/permissions.ts. Toute page ou composant qui a besoin
// de savoir ce que l'utilisateur peut faire doit passer par ce hook, jamais relire
// `role` directement pour recoder ses propres règles.
export function usePermissions(): UsePermissionsResult {
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let annule = false

    const chargerRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          if (!annule) {
            setRole(null)
            setLoading(false)
          }
          return
        }

        const { data, error } = await supabase
          .from('utilisateurs')
          .select('role')
          .eq('auth_user_id', user.id)
          .single()

        if (error) throw error
        if (!annule) setRole(data?.role || null)
      } catch (error) {
        console.error('Erreur chargement rôle utilisateur:', error)
        if (!annule) setRole(null)
      } finally {
        if (!annule) setLoading(false)
      }
    }

    chargerRole()
    return () => {
      annule = true
    }
  }, [])

  const niveau = (ecran: Ecran): Niveau => niveauPourRole(role, ecran)

  return { role, loading, niveau }
}
