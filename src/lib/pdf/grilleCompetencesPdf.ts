// src/lib/pdf/grilleCompetencesPdf.ts
//
// Génère le PDF de la grille de compétences complète (105 réponses CECRL) directement
// côté client avec jsPDF, plutôt que de passer par window.print()/l'impression
// navigateur. Ce chemin s'est révélé peu fiable en pratique : l'aperçu Chrome était
// correct, mais le pilote Windows « Microsoft Print to PDF » produisait un fichier
// vide (chemin de rendu différent, hors de notre contrôle côté CSS), et Firefox n'a
// pas pu être vérifié. jsPDF construit le PDF depuis les mêmes données que la modale
// à l'écran, sans dépendre du navigateur ni d'un pilote d'impression.
import jsPDF from 'jspdf'
import autoTable, { type CellHookData } from 'jspdf-autotable'
import {
  SOUS_QUESTIONS_CECRL,
  STRUCTURE_NIVEAUX,
  type SousQuestionCECRL
} from '@/app/public/inscription/data/competencesCECRL'
import {
  calculerStatistiquesDetaillees,
  type ReponsesUtilisateur
} from '@/app/public/inscription/data/niveauCalcul'
import { VERT_FTM, texteAscii, positionApresTableau } from '@/lib/pdf/pdfUtils'

const NIVEAUX_ORDRE = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

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

const REPONSE_LABEL_KEYS: Record<string, string> = {
  oui: 'deliberation.competenceGridAnswerYes',
  un_peu: 'deliberation.competenceGridAnswerSomewhat',
  non: 'deliberation.competenceGridAnswerNo'
}

// Couleurs de texte pour la colonne "Réponse", alignées sur les classes Tailwind
// utilisées à l'écran (text-green-800 / text-yellow-800 approx. / text-red-800).
const REPONSE_COULEURS: Record<string, [number, number, number]> = {
  oui: [22, 101, 52],
  un_peu: [133, 100, 4],
  non: [153, 27, 27]
}

function nomFichier(inscription: any): string {
  const code = (inscription?.student_code || 'candidat').toString().replace(/[^\w-]/g, '_')
  return `Grille_competences_${code}.pdf`
}

export function genererGrillePdfCompetences(inscription: any, t: (key: string) => string): void {
  // Toutes les traductions insérées dans le PDF passent par ce filtre anti-emoji
  // (voir `texteAscii` ci-dessus) ; `t` brut n'est plus utilisé dans cette fonction.
  const tPdf = (cle: string) => texteAscii(t(cle))
  const reponses: ReponsesUtilisateur = inscription?.reponses_competences || {}
  const grilleRemplie = Object.keys(reponses).length > 0
  const stats = grilleRemplie ? calculerStatistiquesDetaillees(reponses) : null

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const margeGauche = 14
  const largeurUtile = doc.internal.pageSize.getWidth() - margeGauche * 2
  const nomCandidat = `${inscription?.prenom || ''} ${inscription?.nom || ''}`.trim()
  let y = 18

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text(tPdf('deliberation.competenceGridModalTitle'), margeGauche, y)
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(nomCandidat, margeGauche, y)
  y += 6

  doc.setFontSize(9)
  doc.setTextColor(90, 90, 90)
  doc.text(tPdf('deliberation.codeLabel').replace('{code}', inscription?.student_code || ''), margeGauche, y)
  y += 5
  doc.text(
    `${tPdf('deliberation.suggestedLevelLabel')} : ${inscription?.niveau_suggere || '—'}   ·   ` +
      `${tPdf('deliberation.finalLevelLabel')} : ${inscription?.niveau_definitif || tPdf('deliberation.undefinedLevel')}`,
    margeGauche,
    y
  )
  y += 5
  if (grilleRemplie) {
    doc.text(
      tPdf('deliberation.competenceGridSubtitle')
        .replace('{answered}', String(Object.keys(reponses).length))
        .replace('{total}', String(SOUS_QUESTIONS_CECRL.length)),
      margeGauche,
      y
    )
    y += 5
  }
  doc.text(
    tPdf('deliberation.competenceGridPrintedOn').replace('{date}', new Date().toLocaleDateString('fr-FR')),
    margeGauche,
    y
  )
  y += 8
  doc.setTextColor(0, 0, 0)

  // Grille optionnelle côté candidat : sans réponse, on télécharge juste un PDF avec
  // l'en-tête et le message d'état vide, sans tableau ni statistiques trompeuses.
  if (!grilleRemplie) {
    doc.setFontSize(11)
    const lignes = doc.splitTextToSize(tPdf('deliberation.competenceGridEmpty'), largeurUtile)
    doc.text(lignes, margeGauche, y)
    doc.save(nomFichier(inscription))
    return
  }

  // Synthèse par niveau
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(tPdf('deliberation.competenceGridSummaryTitle'), margeGauche, y)
  y += 3

  autoTable(doc, {
    startY: y,
    margin: { left: margeGauche, right: margeGauche },
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: VERT_FTM, textColor: 255 },
    head: [[
      tPdf('deliberation.competenceGridColLevel'),
      tPdf('deliberation.competenceGridColAnswered'),
      tPdf('deliberation.competenceGridColScore'),
      tPdf('deliberation.competenceGridColThreshold')
    ]],
    body: NIVEAUX_ORDRE.map((niveau) => {
      const s = stats![niveau]
      const seuil = STRUCTURE_NIVEAUX.find((n) => n.niveau === niveau)?.seuil ?? 0
      const libNiveau = NIVEAU_LABEL_KEYS[niveau] ? tPdf(NIVEAU_LABEL_KEYS[niveau]) : niveau
      const seuilAtteint = s.seuilAtteint
        ? tPdf('deliberation.competenceGridThresholdReached')
        : tPdf('deliberation.competenceGridThresholdNotReached')
      return [
        `${niveau} — ${libNiveau}`,
        `${s.questionsRepondues}/${s.totalQuestions}`,
        `${s.score}/${s.scoreMaxPossible}`,
        `${seuil} · ${seuilAtteint}`
      ]
    })
  })

  y = positionApresTableau(doc, y) + 10

  // Détail des 105 compétences : un niveau par page, pour une lecture stable à
  // l'impression papier — reprend le découpage déjà utilisé à l'écran.
  NIVEAUX_ORDRE.forEach((niveau, index) => {
    if (index > 0) {
      doc.addPage()
      y = 18
    }

    const competencesNiveau = SOUS_QUESTIONS_CECRL.filter((q) => q.niveau === niveau)
    const libNiveau = NIVEAU_LABEL_KEYS[niveau] ? tPdf(NIVEAU_LABEL_KEYS[niveau]) : niveau

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(VERT_FTM[0], VERT_FTM[1], VERT_FTM[2])
    doc.text(`${niveau} — ${libNiveau} (${competencesNiveau.length})`, margeGauche, y)
    doc.setTextColor(0, 0, 0)
    y += 4

    const corps = competencesNiveau.map((q: SousQuestionCECRL) => {
      const reponse = reponses[q.id]
      const domaine = DOMAINE_LABEL_KEYS[q.domaine] ? tPdf(DOMAINE_LABEL_KEYS[q.domaine]) : q.domaine
      return [
        `Q${q.questionNumero}`,
        domaine,
        String(q.competenceNumero),
        q.texte,
        reponse ? tPdf(REPONSE_LABEL_KEYS[reponse]) : tPdf('deliberation.competenceGridAnswerMissing')
      ]
    })

    autoTable(doc, {
      startY: y,
      margin: { left: margeGauche, right: margeGauche },
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: VERT_FTM, textColor: 255, fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 14 },
        1: { cellWidth: 24 },
        2: { cellWidth: 10 },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 24 }
      },
      head: [[
        tPdf('deliberation.competenceGridColQuestion'),
        tPdf('deliberation.competenceGridColDomain'),
        tPdf('deliberation.competenceGridColNumber'),
        tPdf('deliberation.competenceGridColStatement'),
        tPdf('deliberation.competenceGridColAnswer')
      ]],
      body: corps,
      didParseCell: (data: CellHookData) => {
        if (data.section !== 'body' || data.column.index !== 4) return
        const question = competencesNiveau[data.row.index]
        const reponse = question ? reponses[question.id] : undefined
        if (reponse && REPONSE_COULEURS[reponse]) {
          data.cell.styles.textColor = REPONSE_COULEURS[reponse]
          data.cell.styles.fontStyle = 'bold'
        }
      }
    })

    y = positionApresTableau(doc, y) + 10
  })

  doc.save(nomFichier(inscription))
}
