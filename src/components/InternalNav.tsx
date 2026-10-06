'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { usePermissions } from '@/lib/usePermissions'
import type { Ecran } from '@/lib/permissions'
import logo from '../app/public/logo FTM officiel 2024.jpeg'

interface NavEntry {
  key: string
  href: string
  ecran: Ecran
}

// Un seul écran par entrée : le niveau d'accès (full/view/null) vient de
// src/lib/permissions.ts via usePermissions(), plus de rôles codés en dur ici.
const NAV_ENTRIES: NavEntry[] = [
  { key: 'internalNav.dashboard', href: '/admin', ecran: 'dashboard' },
  { key: 'internalNav.inscriptions', href: '/admin/inscriptions', ecran: 'inscriptions' },
  { key: 'internalNav.deliberation', href: '/teacher/deliberation', ecran: 'deliberation' },
  { key: 'internalNav.classes', href: '/teacher/classes', ecran: 'classes' },
  { key: 'internalNav.enseignants', href: '/admin/enseignants', ecran: 'enseignants' },
  { key: 'internalNav.payments', href: '/admin/payments', ecran: 'payments' },
  { key: 'internalNav.settings', href: '/admin/parametres', ecran: 'settings' },
  { key: 'internalNav.reports', href: '/admin/rapports', ecran: 'reports' },
  { key: 'internalNav.historique', href: '/admin/historique', ecran: 'historique' }
]

export default function InternalNav() {
  const router = useRouter()
  const { t, language, setLanguage } = useTranslation()
  const { role, niveau } = usePermissions()
  const [email, setEmail] = useState<string | null>(null)

  // L'email reste chargé ici (affichage seul) ; le rôle et les niveaux d'accès
  // viennent tous les deux de usePermissions(), seule source de vérité.
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setEmail(user?.email || null))
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-[#689e4e] text-white px-4 py-3">
      <div className="container mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1">
          <Image src={logo} alt={t('internalNav.logoAlt')} className="h-7 w-auto mr-2" />
          {NAV_ENTRIES.map((entry) => {
            const niveauEcran = niveau(entry.ecran)
            // null = entrée masquée (plus de grisé) ; 'view' reste cliquable mais
            // porte un marqueur "lecture seule" traduit à côté du libellé.
            if (niveauEcran === null) return null
            return (
              <Link
                key={entry.href}
                href={entry.href}
                className="px-3 py-1.5 rounded text-sm hover:bg-white/10"
              >
                {t(entry.key)}
                {niveauEcran === 'view' && (
                  <span className="ml-1 text-white/70 text-xs">{t('access.readOnlyNavMarker')}</span>
                )}
              </Link>
            )
          })}
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
