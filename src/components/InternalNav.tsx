'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import logo from '../app/public/logo FTM officiel 2024.jpeg'

interface NavEntry {
  key: string
  href: string
  roles: string[] | null // null = actif pour tous les rôles
}

const NAV_ENTRIES: NavEntry[] = [
  { key: 'internalNav.dashboard', href: '/admin', roles: null },
  { key: 'internalNav.inscriptions', href: '/admin/inscriptions', roles: null },
  { key: 'internalNav.deliberation', href: '/teacher/deliberation', roles: null },
  { key: 'internalNav.classes', href: '/teacher/classes', roles: ['responsable_scolarite', 'responsable_administratif', 'organisation_it'] },
  { key: 'internalNav.payments', href: '/admin/payments', roles: ['comptable', 'responsable_administratif', 'organisation_it'] },
  { key: 'internalNav.settings', href: '/admin/parametres', roles: ['organisation_it'] }
]

export default function InternalNav() {
  const router = useRouter()
  const { t, language, setLanguage } = useTranslation()
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
    <nav className="bg-[#689e4e] text-white px-4 py-3">
      <div className="container mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1">
          <Image src={logo} alt={t('internalNav.logoAlt')} className="h-7 w-auto mr-2" />
          {NAV_ENTRIES.map((entry) => (
            estActif(entry) ? (
              <Link
                key={entry.href}
                href={entry.href}
                className="px-3 py-1.5 rounded text-sm hover:bg-white/10"
              >
                {t(entry.key)}
              </Link>
            ) : (
              <span
                key={entry.href}
                className="px-3 py-1.5 rounded text-sm text-white/40 cursor-not-allowed"
                title={t('internalNav.accessDeniedTooltip')}
              >
                {t(entry.key)}
              </span>
            )
          ))}
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="flex rounded overflow-hidden border border-white/30">
            <button
              onClick={() => setLanguage('fr')}
              className={`px-2 py-1 text-xs ${language === 'fr' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}
            >
              FR
            </button>
            <button
              onClick={() => setLanguage('mg')}
              className={`px-2 py-1 text-xs ${language === 'mg' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}
            >
              MG
            </button>
          </div>
          <span className="text-white/80">
            {email || '...'} {role && `(${role})`}
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded bg-[#527d3e] hover:bg-[#42642f] text-sm"
          >
            {t('internalNav.logout')}
          </button>
        </div>
      </div>
    </nav>
  )
}
