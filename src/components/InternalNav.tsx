'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

interface NavEntry {
  label: string
  href: string
  roles: string[] | null // null = actif pour tous les rôles
}

const NAV_ENTRIES: NavEntry[] = [
  { label: 'Tableau de bord', href: '/admin', roles: null },
  { label: 'Inscriptions', href: '/admin/inscriptions', roles: null },
  { label: 'Délibération', href: '/teacher/deliberation', roles: null },
  { label: 'Classes', href: '/teacher/classes', roles: ['responsable_scolarite', 'responsable_administratif', 'organisation_it'] },
  { label: 'Paiements', href: '/admin/payments', roles: ['comptable', 'responsable_administratif', 'organisation_it'] },
  { label: 'Paramètres', href: '/admin/parametres', roles: ['organisation_it'] }
]

export default function InternalNav() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    loadUtilisateur()
  }, [])

  const loadUtilisateur = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setEmail(user.email || null)

      const { data, error } = await supabase
        .from('utilisateurs')
        .select('role')
        .eq('auth_user_id', user.id)
        .single()

      if (error) throw error
      setRole(data?.role || null)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const estActif = (entry: NavEntry) => !entry.roles || (role !== null && entry.roles.includes(role))

  return (
    <nav className="bg-blue-800 text-white px-4 py-3">
      <div className="container mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {NAV_ENTRIES.map((entry) => (
            estActif(entry) ? (
              <Link
                key={entry.href}
                href={entry.href}
                className="px-3 py-1.5 rounded text-sm hover:bg-blue-700"
              >
                {entry.label}
              </Link>
            ) : (
              <span
                key={entry.href}
                className="px-3 py-1.5 rounded text-sm text-blue-300 cursor-not-allowed"
                title="Accès non autorisé pour votre rôle"
              >
                {entry.label}
              </span>
            )
          ))}
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-blue-200">
            {email || '...'} {role && `(${role})`}
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded bg-blue-900 hover:bg-blue-950 text-sm"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  )
}
