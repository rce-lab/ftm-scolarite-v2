// src/lib/pdf/rapportPdf.ts
// Générateur PDF générique pour les rapports (src/app/admin/rapports/**), utilisé à
// la place de window.print(). Le bouton "Imprimer" (impression navigateur) posait
// deux problèmes sur ces tableaux larges : format portrait imposé par défaut (lignes
// tronquées) et la pagination de l'aperçu d'impression qui ne fonctionnait pas de
// façon fiable selon le pilote. jsPDF + jspdf-autotable construit le PDF directement
// en paysage avec une vraie pagination multi-page, indépendamment du navigateur —
// même principe que grilleCompetencesPdf.ts.
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { VERT_FTM, texteAscii, positionApresTableau } from '@/lib/pdf/pdfUtils'

interface OptionsRapportPdf {
  titre: string
  sousTitre?: string
  colonnes: string[]
  lignes: (string | number)[][]
  nomFichier: string
}

export function genererRapportPdf({ titre, sousTitre, colonnes, lignes, nomFichier }: OptionsRapportPdf): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
  const margeGauche = 10
  let y = 14

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(VERT_FTM[0], VERT_FTM[1], VERT_FTM[2])
  doc.text(texteAscii(titre), margeGauche, y)
  doc.setTextColor(0, 0, 0)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  if (sousTitre) {
    doc.text(texteAscii(sousTitre), margeGauche, y)
    y += 4
  }
  doc.text(
    texteAscii(`Édité le ${new Date().toLocaleDateString('fr-FR')} — ${lignes.length} ligne(s)`),
    margeGauche,
    y
  )
  y += 4

  autoTable(doc, {
    startY: y,
    margin: { left: margeGauche, right: margeGauche },
    styles: { fontSize: 8, cellPadding: 1.5, overflow: 'linebreak' },
    headStyles: { fillColor: VERT_FTM, textColor: 255 },
    // Répète l'en-tête sur chaque page générée automatiquement par autoTable —
    // c'est cette pagination native qui remplace l'aperçu d'impression du
    // navigateur, peu fiable sur un tableau de cette largeur.
    showHead: 'everyPage',
    head: [colonnes.map((c) => texteAscii(c))],
    body: lignes.map((ligne) => ligne.map((cellule) => texteAscii(String(cellule ?? ''))))
  })

  doc.save(nomFichier)
}

// ---------------------------------------------------------------------------
// Variante multi-blocs (rapport « Délibérations du jour ») : plusieurs tableaux
// titrés à la suite, surlignage de lignes/cellules et pied de page « Page n/N ».
// genererRapportPdf ci-dessus reste inchangé pour les rapports à tableau unique.
// ---------------------------------------------------------------------------

export const BLEU_ATTENTE: [number, number, number] = [219, 234, 254] // bg-blue-100
export const AMBRE_ECART: [number, number, number] = [253, 230, 138] // bg-amber-200

export interface SectionRapportPdf {
  titre: string
  lignes: (string | number)[][]
  // Colonnes propres à la section (sinon celles du rapport)
  colonnes?: string[]
  // Indices de lignes surlignées entièrement (dossiers en attente)
  lignesSurlignees?: number[]
  // Cellules surlignées [ligne, colonne] (niveau retenu ≠ suggéré)
  cellulesSurlignees?: [number, number][]
  // Démarre la section sur une nouvelle page (page « Points à confirmer »)
  nouvellePage?: boolean
  messageVide?: string
}

interface OptionsRapportSectionsPdf {
  titre: string
  sousTitre?: string
  lignesInfo?: string[]
  colonnes: string[]
  sections: SectionRapportPdf[]
  nomFichier: string
}

export function genererRapportSectionsPdf({
  titre, sousTitre, lignesInfo = [], colonnes, sections, nomFichier
}: OptionsRapportSectionsPdf): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
  const margeGauche = 10
  const hauteurPage = doc.internal.pageSize.getHeight()
  let y = 14

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(VERT_FTM[0], VERT_FTM[1], VERT_FTM[2])
  doc.text(texteAscii(titre), margeGauche, y)
  doc.setTextColor(0, 0, 0)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  if (sousTitre) {
    doc.text(texteAscii(sousTitre), margeGauche, y)
    y += 4
  }
  doc.text(texteAscii(`Édité le ${new Date().toLocaleDateString('fr-FR')}`), margeGauche, y)
  y += 4
  lignesInfo.forEach((info) => {
    doc.text(texteAscii(info), margeGauche, y)
    y += 4
  })

  sections.forEach((section) => {
    if (section.nouvellePage) {
      doc.addPage()
      y = 14
    } else {
      y += 4
      // Évite un titre de bloc orphelin en bas de page
      if (y > hauteurPage - 30) {
        doc.addPage()
        y = 14
      }
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(VERT_FTM[0], VERT_FTM[1], VERT_FTM[2])
    doc.text(texteAscii(section.titre), margeGauche, y)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    y += 2

    if (section.lignes.length === 0) {
      y += 4
      doc.text(texteAscii(section.messageVide || '—'), margeGauche, y)
      y += 2
      return
    }

    const lignesSurlignees = new Set(section.lignesSurlignees || [])
    const cellulesSurlignees = new Set((section.cellulesSurlignees || []).map(([l, c]) => `${l}:${c}`))

    autoTable(doc, {
      startY: y,
      margin: { left: margeGauche, right: margeGauche, bottom: 14 },
      styles: { fontSize: 8, cellPadding: 1.5, overflow: 'linebreak' },
      headStyles: { fillColor: VERT_FTM, textColor: 255 },
      showHead: 'everyPage',
      head: [(section.colonnes || colonnes).map((c) => texteAscii(c))],
      body: section.lignes.map((ligne) => ligne.map((cellule) => texteAscii(String(cellule ?? '')))),
      didParseCell: (data) => {
        if (data.section !== 'body') return
        if (cellulesSurlignees.has(`${data.row.index}:${data.column.index}`)) {
          data.cell.styles.fillColor = AMBRE_ECART
        } else if (lignesSurlignees.has(data.row.index)) {
          data.cell.styles.fillColor = BLEU_ATTENTE
        }
      }
    })
    y = positionApresTableau(doc, y)
  })

  // Pied de page posé après coup : le nombre total de pages n'est connu qu'ici
  const nbPages = doc.getNumberOfPages()
  for (let page = 1; page <= nbPages; page++) {
    doc.setPage(page)
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`Page ${page}/${nbPages}`, doc.internal.pageSize.getWidth() - margeGauche, hauteurPage - 6, { align: 'right' })
  }

  doc.save(nomFichier)
}
