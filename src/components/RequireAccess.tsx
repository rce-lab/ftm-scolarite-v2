// src/components/RequireAccess.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/lib/usePermissions'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import type { Ecran } from '@/lib/permissions'

interface RequireAccessProps {
  ecran: Ecran
  // Render-prop plutôt qu'un simple `children` : le niveau d'accès ('full' | 'view')
  // doit être transmis à la page sous forme du booléen `readOnly`, pour qu'elle
  // désactive ses propres actions d'écriture (cf. item 5 de la tâche).
  children: (readOnly: boolean) => React.ReactNode
}

// Garde de page unique pour tout /admin/* et /teacher/* : chargement → spinner ;
// accès refusé (null) → redirection vers /admin ; accès en lecture ('view') →
// bandeau "lecture seule" + readOnly=true transmis à la page.
export default function RequireAccess({ ecran, children }: RequireAccessProps) {
  const { loading, niveau } = usePermissions()
  const { t } = useTranslation()
  const router = useRouter()
  const niveauEcran = niveau(ecran)

  useEffect(() => {
    if (loading) return
    // /admin (dashboard) est la destination de repli des redirections : si le
    // dashboard lui-même nous refuse l'accès, rediriger vers /admin boucterait
    // indéfiniment. On affiche alors un refus sur place plutôt que de rediriger.
    if (niveauEcran === null && ecran !== 'dashboard') {
      router.replace('/admin')
    }
  }, [loading, niveauEcran, ecran, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#689e4e]"></div>
      </div>
    )
  }

  if (niveauEcran === null) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">🔒</div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">{t('access.deniedTitle')}</h3>
        <p className="text-gray-600">{t('access.deniedMessage')}</p>
      </div>
    )
  }

  const readOnly = niveauEcran === 'view'

  return (
    <>
      {readOnly && (
        <div className="mb-4 px-4 py-2 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded text-sm flex items-center gap-2">
          <span>🔎</span>
          <span>{t('access.readOnlyBanner')}</span>
        </div>
      )}
      {children(readOnly)}
    </>
  )
}
