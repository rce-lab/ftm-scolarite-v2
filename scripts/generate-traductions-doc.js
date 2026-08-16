#!/usr/bin/env node
// scripts/generate-traductions-doc.js
//
// Régénère TRADUCTIONS_A_FAIRE.md à partir de src/lib/i18n/translations.ts
// (traductions internes français/malgache uniquement — src/lib/i18n/publicTranslations.ts,
// le formulaire public français/anglais, n'est jamais couvert par ce document).
//
// Extraction par expression régulière, pas de vrai parseur TypeScript : suppose une structure
// à 2 niveaux (section -> clé -> { fr: '...'|"...", mg: '...'|"..." }), une entrée par ligne.
// Si la structure de translations.ts change (entrées multi-lignes, imbrication plus profonde,
// valeurs non-string), ce script doit être adapté en conséquence.

const fs = require('fs')
const path = require('path')

const SOURCE_PATH = path.join(__dirname, '..', 'src', 'lib', 'i18n', 'translations.ts')
const OUTPUT_PATH = path.join(__dirname, '..', 'TRADUCTIONS_A_FAIRE.md')

const START_MARKER = 'export const translations = {'

const SECTION_TITLES = {
  login: 'Page de connexion',
  changePassword: 'Changement de mot de passe',
  internalNav: 'Barre de navigation interne (InternalNav)',
  historique: 'Historique des inscriptions (archive 2023-2026)',
  adminDashboard: 'Tableau de bord (admin)',
  inscriptionsList: 'Liste des inscriptions',
  inscriptionsDetail: "Détail d'une inscription",
  payments: 'Suivi des paiements',
  settings: 'Paramètres',
  students: 'Gestion des étudiants',
  deliberation: 'Délibération (conseil des enseignants)',
  classes: 'Gestion des classes',
  reports: 'Rapports',
  emailAdminNotification: 'Email de notification interne (nouvelle inscription)'
}

const SECTION_HEADER_RE = /^ {2}([A-Za-z0-9_]+):\s*\{\s*$/
const SECTION_CLOSE_RE = /^ {2}\},?\s*$/
const ENTRY_RE = /^ {4}([A-Za-z0-9_]+):\s*\{\s*fr:\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"),\s*mg:\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")\s*\}\s*,?\s*$/

function unquote(raw) {
  const quoteChar = raw[0]
  const inner = raw.slice(1, -1)
  const escapedQuote = quoteChar === "'" ? /\\'/g : /\\"/g
  return inner.replace(escapedQuote, quoteChar).replace(/\\\\/g, '\\')
}

function extractSections(source) {
  const startIdx = source.indexOf(START_MARKER)
  if (startIdx === -1) {
    throw new Error(`Marqueur "${START_MARKER}" introuvable dans ${SOURCE_PATH} — la structure du fichier a peut-être changé.`)
  }

  const body = source.slice(startIdx + START_MARKER.length)
  const lines = body.split('\n').map((line) => line.replace(/\r$/, ''))

  const sections = []
  let current = null

  for (const line of lines) {
    if (current === null) {
      const headerMatch = line.match(SECTION_HEADER_RE)
      if (headerMatch) {
        current = { name: headerMatch[1], entries: [] }
        sections.push(current)
      }
      continue
    }

    if (SECTION_CLOSE_RE.test(line)) {
      current = null
      continue
    }

    const entryMatch = line.match(ENTRY_RE)
    if (entryMatch) {
      const [, key, frRaw, mgRaw] = entryMatch
      current.entries.push({
        key: `${current.name}.${key}`,
        fr: unquote(frRaw),
        mg: unquote(mgRaw)
      })
    }
  }

  return sections
}

function escapeMarkdownCell(text) {
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

function generateMarkdown(sections) {
  const totalEntries = sections.reduce((sum, s) => sum + s.entries.length, 0)
  const lines = []

  lines.push('# Traductions à faire — FTM Scolarité')
  lines.push('')
  lines.push('**⚠️ Document généré automatiquement par `npm run generate-traductions-doc` à partir de `src/lib/i18n/translations.ts` — ne pas éditer ce fichier à la main, toute modification manuelle serait écrasée à la prochaine génération. Toute entrée ci-dessous reste un brouillon à vérifier par un locuteur natif tant qu\'elle n\'a pas été explicitement confirmée par Charles.**')
  lines.push('')
  lines.push("Ce document recense uniquement les traductions français/malgache **internes** (admin, enseignants, connexion) définies dans `src/lib/i18n/translations.ts`. Il ne couvre **pas** les traductions français/anglais du formulaire public candidat (`src/lib/i18n/publicTranslations.ts`), qui n'ont jamais eu besoin de validation par un locuteur natif.")
  lines.push('')
  lines.push(`Généré le ${new Date().toISOString().slice(0, 10)} — ${sections.length} sections, ${totalEntries} entrées.`)
  lines.push('')
  lines.push('---')
  lines.push('')

  for (const section of sections) {
    const title = SECTION_TITLES[section.name] || section.name
    lines.push(`## ${title}`)
    lines.push('')
    lines.push('| Clé | Français | Malgache |')
    lines.push('|---|---|---|')
    for (const entry of section.entries) {
      lines.push(`| ${escapeMarkdownCell(entry.key)} | ${escapeMarkdownCell(entry.fr)} | ${escapeMarkdownCell(entry.mg)} |`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

function main() {
  const source = fs.readFileSync(SOURCE_PATH, 'utf-8')
  const sections = extractSections(source)
  const totalEntries = sections.reduce((sum, s) => sum + s.entries.length, 0)

  if (totalEntries === 0) {
    throw new Error('Aucune entrée extraite — la structure de translations.ts a peut-être changé, vérifier les regex du script.')
  }

  const markdown = generateMarkdown(sections)
  fs.writeFileSync(OUTPUT_PATH, markdown, 'utf-8')

  console.log(`${OUTPUT_PATH} régénéré : ${sections.length} sections, ${totalEntries} entrées.`)
  for (const s of sections) {
    console.log(`  - ${s.name}: ${s.entries.length} entrée(s)`)
  }
}

main()
