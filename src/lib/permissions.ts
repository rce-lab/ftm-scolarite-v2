// src/lib/permissions.ts
//
// Source unique de vérité pour le contrôle d'accès par rôle. Toute nouvelle page
// admin/teacher doit déclarer son écran dans `Ecran` et se protéger avec
// <RequireAccess ecran="..."> (src/components/RequireAccess.tsx) plutôt que de coder
// son propre contrôle de rôle. La barre de navigation (InternalNav) et le hook
// usePermissions() (src/lib/usePermissions.ts) lisent tous les deux cette même table.

export type Niveau = 'full' | 'view' | null

export type Ecran =
  | 'dashboard'
  | 'inscriptions'
  | 'deliberation'
  | 'classes'
  | 'enseignants'
  | 'payments'
  | 'settings'
  | 'reports'
  | 'historique'

export type Role =
  | 'organisation_it'
  | 'responsable_scolarite'
  | 'responsable_administratif'
  | 'comptable'
  | 'responsable_communication'
  | 'responsable_etudes'
  | 'direction'

type PermissionsEcran = Record<Ecran, Niveau>

// Base « full partout », reprise et surchargée par chaque rôle ci-dessous plutôt que
// répétée : limite le risque d'oubli d'un écran quand la liste des écrans évolue.
const TOUT_FULL: PermissionsEcran = {
  dashboard: 'full',
  inscriptions: 'full',
  deliberation: 'full',
  classes: 'full',
  enseignants: 'full',
  payments: 'full',
  settings: 'full',
  reports: 'full',
  historique: 'full'
}

export const ROLE_PERMISSIONS: Record<Role, PermissionsEcran> = {
  organisation_it: { ...TOUT_FULL },

  responsable_scolarite: { ...TOUT_FULL, payments: null, settings: null },

  // Settings reste le seul écran interdit ; payments reste 'full' (précisé dans la
  // demande d'origine pour éviter toute ambiguïté avec responsable_scolarite ci-dessus).
  responsable_administratif: { ...TOUT_FULL, settings: null },

  comptable: {
    dashboard: 'full',
    inscriptions: 'view',
    deliberation: 'view',
    classes: 'view',
    enseignants: 'view',
    payments: 'full',
    settings: 'view',
    reports: 'full',
    historique: 'full'
  },

  responsable_communication: {
    dashboard: 'full',
    inscriptions: 'view',
    deliberation: null,
    classes: null,
    enseignants: null,
    payments: 'view',
    settings: null,
    reports: 'full',
    historique: 'full'
  },

  responsable_etudes: {
    dashboard: 'full',
    inscriptions: 'view',
    deliberation: null,
    classes: 'view',
    enseignants: 'view',
    payments: null,
    settings: null,
    reports: 'full',
    historique: 'full'
  },

  direction: {
    dashboard: 'full',
    inscriptions: 'view',
    deliberation: 'view',
    classes: 'view',
    enseignants: 'view',
    payments: 'view',
    settings: null,
    reports: 'full',
    historique: 'full'
  }
}

function estRoleConnu(role: string): role is Role {
  return role in ROLE_PERMISSIONS
}

// Rôle inconnu ou non chargé (utilisateur pas encore authentifié, ligne absente de la
// table `utilisateurs`, valeur de `role` qui ne correspond à aucune clé ci-dessus) :
// null partout — refus par défaut, jamais d'accès implicite.
export function niveauPourRole(role: string | null | undefined, ecran: Ecran): Niveau {
  if (!role || !estRoleConnu(role)) return null
  return ROLE_PERMISSIONS[role][ecran]
}
