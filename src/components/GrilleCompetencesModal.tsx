// src/components/GrilleCompetencesModal.tsx
'use client'

import { useTranslation } from '@/lib/i18n/LanguageContext'
import {
  SOUS_QUESTIONS_CECRL,
  STRUCTURE_NIVEAUX,
  type SousQuestionCECRL
} from '@/app/public/inscription/data/competencesCECRL'
import { calculerStatistiquesDetaillees } from '@/app/public/inscription/data/niveauCalcul'

type Reponse = 'oui' | 'un_peu' | 'non'

const NIVEAUX_ORDRE = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

// Libellé de niveau (DÉCOUVERTE, INTERMÉDIAIRE...) : traduit ici plutôt que repris
// du champ `libelleNiveau` des données, qui n'existe qu'en français.
const NIVEAU_LABEL_KEYS: Record<string, string> = {
  A1: 'deliberation.competenceGridLevelA1',
  A2: 'deliberation.competenceGridLevelA2',
  B1: 'deliberation.competenceGridLevelB1',
  B2: 'deliberation.competenceGridLevelB2',
  C1: 'deliberation.competenceGridLevelC1',
  C2: 'deliberation.competenceGridLevelC2'
}

const DOMAINE_LABEL_KEYS: Record<string, string> = {
  COMPRENDRE: 'deliberation.competenceGridDomainComprendre',
  PARLER: 'deliberation.competenceGridDomainParler',
  ECRIRE: 'deliberation.competenceGridDomainEcrire'
}

const REPONSE_LABEL_KEYS: Record<Reponse, string> = {
  oui: 'deliberation.competenceGridAnswerYes',
  un_peu: 'deliberation.competenceGridAnswerSomewhat',
  non: 'deliberation.competenceGridAnswerNo'
}

const REPONSE_CLASSES: Record<Reponse, string> = {
  oui: 'bg-green-100 text-green-800 border-green-300',
  un_peu: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  non: 'bg-red-100 text-red-800 border-red-300'
}

interface Props {
  inscription: any
  onClose: () => void
}

export default function GrilleCompetencesModal({ inscription, onClose }: Props) {
  const { t } = useTranslation()

  const reponses: Record<string, Reponse> = inscription?.reponses_competences || {}
  const nbReponses = Object.keys(reponses).length
  const grilleRemplie = nbReponses > 0

  // La grille est optionnelle côté candidat : sans réponse, les statistiques par
  // niveau ne produiraient que des zéros trompeurs, on ne les calcule donc pas.
  const stats = grilleRemplie ? calculerStatistiquesDetaillees(reponses) : null

  // Regroupement niveau → question (numéro + domaine) → compétences. Le tri explicite
  // évite de dépendre de l'ordre de déclaration du fichier de données.
  const niveauxGroupes = NIVEAUX_ORDRE.map((niveau) => {
    const competences = SOUS_QUESTIONS_CECRL.filter((q) => q.niveau === niveau)
    const questions: { numero: number; domaine: string; competences: SousQuestionCECRL[] }[] = []
    competences.forEach((competence) => {
      let groupe = questions.find((q) => q.numero === competence.questionNumero)
      if (!groupe) {
        groupe = { numero: competence.questionNumero, domaine: competence.domaine, competences: [] }
        questions.push(groupe)
      }
      groupe.competences.push(competence)
    })
    questions.sort((a, b) => a.numero - b.numero)
    questions.forEach((q) => q.competences.sort((a, b) => a.competenceNumero - b.competenceNumero))
    return { niveau, questions, total: competences.length }
  })

  const libelleNiveau = (niveau: string) =>
    NIVEAU_LABEL_KEYS[niveau] ? t(NIVEAU_LABEL_KEYS[niveau]) : niveau

  const libelleDomaine = (domaine: string) =>
    DOMAINE_LABEL_KEYS[domaine] ? t(DOMAINE_LABEL_KEYS[domaine]) : domaine

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto p-4">
      {/* À l'impression, seule la grille reste visible : le reste de la page
          (navigation, tableau des inscriptions, panneau de délibération) est masqué. */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #grille-competences, #grille-competences * { visibility: visible; }
          #grille-competences {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            margin: 0;
            max-width: none;
            border-radius: 0;
            box-shadow: none;
          }
          .grille-no-print { display: none !important; }
          .grille-niveau { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      <div
        id="grille-competences"
        className="bg-white rounded-lg shadow w-full max-w-4xl my-4"
      >
        <div className="flex justify-between items-start gap-4 p-6 border-b">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-3">
              <span className="w-1 self-stretch bg-[#689e4e] rounded-sm"></span>
              {t('deliberation.competenceGridModalTitle')}
            </h2>
            <p className="mt-2 font-medium">
              {inscription.prenom} {inscription.nom}
            </p>
            <p className="text-sm text-gray-600">
              {t('deliberation.codeLabel').replace('{code}', inscription.student_code)}
            </p>
            <p className="text-sm text-gray-600">
              {t('deliberation.suggestedLevelLabel')} :{' '}
              <span className="font-medium">{inscription.niveau_suggere || '—'}</span>
              {' · '}
              {t('deliberation.finalLevelLabel')} :{' '}
              <span className="font-medium">
                {inscription.niveau_definitif || t('deliberation.undefinedLevel')}
              </span>
            </p>
            {grilleRemplie && (
              <p className="text-sm text-gray-600 mt-1">
                {t('deliberation.competenceGridSubtitle')
                  .replace('{answered}', String(nbReponses))
                  .replace('{total}', String(SOUS_QUESTIONS_CECRL.length))}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {t('deliberation.competenceGridPrintedOn').replace(
                '{date}',
                new Date().toLocaleDateString('fr-FR')
              )}
            </p>
          </div>

          <div className="flex gap-2 grille-no-print">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-[#689e4e] text-white rounded text-sm hover:bg-[#527d3e] whitespace-nowrap"
            >
              {t('deliberation.competenceGridPrintButton')}
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 whitespace-nowrap"
            >
              {t('deliberation.competenceGridCloseButton')}
            </button>
          </div>
        </div>

        {!grilleRemplie ? (
          <div className="p-6">
            <p className="p-4 bg-gray-50 border border-gray-200 rounded text-base text-gray-700">
              {t('deliberation.competenceGridEmpty')}
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Synthèse par niveau */}
            <div>
              <h3 className="font-bold mb-2">{t('deliberation.competenceGridSummaryTitle')}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">{t('deliberation.competenceGridColLevel')}</th>
                      <th className="px-3 py-2 text-left font-medium">{t('deliberation.competenceGridColAnswered')}</th>
                      <th className="px-3 py-2 text-left font-medium">{t('deliberation.competenceGridColScore')}</th>
                      <th className="px-3 py-2 text-left font-medium">{t('deliberation.competenceGridColThreshold')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {NIVEAUX_ORDRE.map((niveau) => {
                      const s = stats?.[niveau]
                      const seuil = STRUCTURE_NIVEAUX.find((n) => n.niveau === niveau)?.seuil ?? 0
                      return (
                        <tr key={niveau}>
                          <td className="px-3 py-2 font-medium">
                            {niveau} — {libelleNiveau(niveau)}
                          </td>
                          <td className="px-3 py-2">
                            {s ? `${s.questionsRepondues}/${s.totalQuestions}` : '—'}
                          </td>
                          <td className="px-3 py-2">
                            {s ? `${s.score}/${s.scoreMaxPossible}` : '—'}
                          </td>
                          <td className="px-3 py-2">
                            {seuil}
                            {' · '}
                            {s?.seuilAtteint
                              ? t('deliberation.competenceGridThresholdReached')
                              : t('deliberation.competenceGridThresholdNotReached')}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Détail des 105 compétences */}
            {niveauxGroupes.map(({ niveau, questions, total }) => (
              <div key={niveau} className="grille-niveau border border-gray-200 rounded">
                <div className="px-3 py-2 bg-[#689e4e]/10 border-b border-gray-200">
                  <h3 className="font-bold text-[#527d3e]">
                    {niveau} — {libelleNiveau(niveau)}{' '}
                    <span className="font-normal text-gray-600 text-sm">({total})</span>
                  </h3>
                </div>

                {questions.map((question) => (
                  <div key={question.numero} className="border-b border-gray-100 last:border-b-0">
                    <div className="px-3 py-1.5 bg-gray-50 text-sm font-medium text-gray-700">
                      {t('deliberation.competenceGridQuestionLabel')
                        .replace('{n}', String(question.numero))
                        .replace('{domaine}', libelleDomaine(question.domaine))}
                    </div>
                    <ul>
                      {question.competences.map((competence) => {
                        const reponse = reponses[competence.id]
                        return (
                          <li
                            key={competence.id}
                            className="px-3 py-2 flex items-start justify-between gap-3 border-t border-gray-100"
                          >
                            <div className="flex-1">
                              <span className="text-xs text-gray-500 mr-2">
                                {t('deliberation.competenceGridCompetenceLabel').replace(
                                  '{n}',
                                  String(competence.competenceNumero)
                                )}
                              </span>
                              <span className="text-sm text-gray-800">{competence.texte}</span>
                            </div>
                            <span
                              className={`px-2 py-0.5 text-xs rounded border whitespace-nowrap ${
                                reponse
                                  ? REPONSE_CLASSES[reponse]
                                  : 'bg-gray-100 text-gray-600 border-gray-300'
                              }`}
                            >
                              {reponse
                                ? t(REPONSE_LABEL_KEYS[reponse])
                                : t('deliberation.competenceGridAnswerMissing')}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
